#include <sails/sails-sequence.h>
#include <sails/sails-utils.h>
#include <sails/density/sails-density.h>
#include <sails/density/sails-xtal-density.h>
#include <sails/density/sails-em-density.h>
#include <sails/sails-json.h>
#include <sails/sails-sequence.h>
#include <sails/sails-glycan.h>
#include <sails/sails-topology.h>
#include <sails/sails-linkage.h>
#include <sails/sails-cif.h>
#include <sails/sails-telemetry.h>
#include <sails/sails-wurcs.h>
#include <sails/snfg/sails-snfg.h>
// #include <src/include/sails-gemmi-bindings.h>
#include <sails/sails-solvent.h>
#include <sails/sails-morph.h>

#include "gemmi/model.hpp" // for Structure
#include "gemmi/mmread.hpp" // for read_structure
#include "gemmi/resinfo.hpp" // for find_tabulated_residue
#include "gemmi/ccp4.hpp" // for find_tabulated_residue
#include "gemmi/mtz.hpp" // for mtz
#include "gemmi/to_cif.hpp" // for cif writing


#include <chrono>
#include <iostream>


struct SiteResult {
    SiteResult() = default;
    SiteResult(const std::string& chain,
                const std::string& seqid,
                const std::string& name,
                const std::string& type): chain(chain), seqid(seqid), name(name), type(type) {
        key = chain + "/" + name + "/" + seqid;
    }

    std::string chain;
    std::string seqid;
    std::string name;
    std::string type;
    std::string key;
};

gemmi::Structure parse_coordinates(const std::string& file) {
    char *c_data = (char *)file.c_str();
    size_t size = file.length();

    if (size == 0) {
        return {};
    }

    ::gemmi::Structure structure = ::gemmi::read_structure_from_char_array(c_data, size, "");
    return structure;
}

std::vector<SiteResult> find_sites(const std::string &file, const std::string &name) {

    gemmi::Structure structure = parse_coordinates(file);
    std::vector<SiteResult> results = {};

    Sails::Glycosites n_glycosyation_sites = Sails::find_n_glycosylation_sites(structure);
    for (int i = 0; i < n_glycosyation_sites.size(); i++) {
        gemmi::Residue* residue_ptr = Sails::Utils::get_residue_ptr_from_glycosite(n_glycosyation_sites[i], &structure);
        gemmi::Chain* chain_ptr = Sails::Utils::get_chain_ptr_from_glycosite(n_glycosyation_sites[i], &structure);
        results.emplace_back(chain_ptr->name, residue_ptr->seqid.str(), residue_ptr->name, "n-glycosylation");
    }

    Sails::Glycosites c_glycosyation_sites = Sails::find_c_glycosylation_sites(structure);
    for (int i = 0; i < c_glycosyation_sites.size(); i++) {
        gemmi::Residue* residue_ptr = Sails::Utils::get_residue_ptr_from_glycosite(c_glycosyation_sites[i], &structure);
        gemmi::Chain* chain_ptr = Sails::Utils::get_chain_ptr_from_glycosite(c_glycosyation_sites[i], &structure);
        results.emplace_back(chain_ptr->name, residue_ptr->seqid.str(), residue_ptr->name, "c-glycosylation");
    }

    return results;
  }



void print_rejection_dds(const Sails::Glycosite& s1, const Sails::Glycosite& s2, gemmi::Structure* structure, float score) {
    std::cout << "Removing " << Sails::Utils::format_residue_from_site(s1, structure) << "--"
    << Sails::Utils::format_residue_from_site(s2, structure) << " because of high DDS = " << score <<std::endl;
}

void print_removal_rscc(const gemmi::Residue& residue, float rscc) {
    std::cout << "Removing " << Sails::Utils::format_residue_key(&residue) << " because of low RSCC =" << rscc << std::endl;
}


void remove_erroneous_sugars(gemmi::Structure *structure, Sails::Density *density, Sails::Glycan *glycan, bool strict,
                             bool debug) {
    const float rscc_threshold = strict ? 0.65: 0.5;
    const float dds_threshold = strict ? 1.0: 1.1;

    std::vector<Sails::Sugar *> to_remove;
    for (const auto &[fst, snd]: *glycan) {
        gemmi::Residue residue = Sails::Utils::get_residue_from_glycosite(snd->site, structure);

        std::optional<Sails::Sugar *> sugar_result = glycan->find_previous_sugar(snd.get());
        if (!sugar_result.has_value()) continue; // if there is nothing previous, it must be a protein residue

        gemmi::Residue previous_residue = Sails::Utils::get_residue_from_glycosite(
            sugar_result.value()->site, structure);

        // if (residue.name == "ASN") { continue; } // don't remove ASN
        // if (residue.name == "TRP") { continue; } // don't remove TRP

        // remove cases with low rscc
        if (const float rscc = density->rscc_score(residue); rscc < rscc_threshold) {
            to_remove.emplace_back(snd.get()); // add pointer to
            if (debug) print_removal_rscc(residue, rscc);
            continue;
        }

        // remove cases with high difference density score
        if (const float diff_score = density->difference_density_score(residue); diff_score > dds_threshold) {
            if (debug) print_rejection_dds(sugar_result.value()->site, fst, structure, diff_score);
            to_remove.emplace_back(snd.get());
        }
    }

    // add linked sugars to removal list
    for (auto &sugar: to_remove) {
        std::vector<Sails::Sugar *> additional_sugars;
        for (auto &linked_sugar: glycan->adjacency_list[sugar]) {
            // check that the linked sugar is not already in the removal list
            if (std::find(to_remove.begin(), to_remove.end(), linked_sugar) != to_remove.end()) continue;

            additional_sugars.emplace_back(linked_sugar);
        }
        to_remove.insert(to_remove.end(), additional_sugars.begin(), additional_sugars.end());
    }

    // sort removal in decsending order so removed indices don't cause later array overflow
    std::sort(to_remove.begin(), to_remove.end(), [](const Sails::Sugar *a, const Sails::Sugar *b) {
        return !(a->site < b->site);
    });

    for (auto &sugar: to_remove) {
        glycan->remove_sugar(sugar);
    }
}

std::string sails_test(const std::string& coordinates_string, const std::string& mtz_filename, const std::string& chain, int seqid) {
    gemmi::Structure structure = parse_coordinates(coordinates_string);
    gemmi::Mtz mtz = gemmi::read_mtz_file(mtz_filename);
    std::string data_file ="/data/sails/data.json";

    auto potential_site = Sails::find_site(structure, chain, seqid);
    if (!potential_site.has_value()) {
        return "";
    }
    Sails::Glycosite glycosite = potential_site.value();


    Sails::JSONLoader loader = {data_file};
    Sails::ResidueDatabase residue_database = loader.load_residue_database();
    Sails::LinkageDatabase linkage_database = loader.load_linkage_database();
    int cycles = 1;
    bool strict = false;
    bool verbose = true;

    gemmi::Structure original_structure = structure;
//    check_spacegroup(&mtz, &structure); // check to ensure the MTZ has a spacegroup

    Sails::Topology topology = {&structure, residue_database};
//     Sails::SNFG snfg = Sails::SNFG(&structure, &residue_database);

    auto density = Sails::XtalDensity(mtz, "F", "SIGF");
    density.recalculate_map(structure);
    density.calculate_po_pc_map(original_structure);

    structure.cell = density.get_mtz()->cell;
    structure.spacegroup_hm = density.get_mtz()->spacegroup_name;

    Sails::Model model = {&structure, linkage_database, residue_database, "/data/ccp4_lib/data/monomers"};
//     model.set_special_monomer_dir("/baby-gru");

    Sails::Telemetry telemetry = Sails::Telemetry("");

    for (int i = 1; i <= cycles; i++) {
        if (!verbose) std::cout << "\rCycle #" << i;
        std::cout << std::flush;
        if (verbose) std::cout << "\rCycle #" << i << std::endl;

       {
           Sails::Glycan glycan = topology.find_glycan_topology(glycosite);
            // if (glycan.empty()) { continue; }

            // find terminal sugars
            Sails::Glycan new_glycan = model.extend(glycan, glycosite, density, verbose);

//             std::set<Sails::Glycosite> differences = new_glycan - glycan;
//             telemetry << differences;

            topology.set_structure(model.get_structure());
        }

        // recalculate maps
        density.recalculate_map(structure);
        density.calculate_po_pc_map(original_structure);
        {
            // remove erroneous sugars
            Sails::Glycan glycan = topology.find_glycan_topology(glycosite);
            if (glycan.empty()) { continue; }

            // std::cout << "Attempting removal at " << Sails::Utils::format_residue_from_site(glycosite, &structure) << std::endl;
            Sails::Glycan old_glycan = glycan;
            remove_erroneous_sugars(&structure, &density, &glycan, strict, verbose);

            topology.set_structure(&structure); // need to update neighbor search after removing n residues
            Sails::Glycan new_glycan = topology.find_glycan_topology(glycosite);

//             std::set<Sails::Glycosite> differences = old_glycan - new_glycan;
//             telemetry >> differences;

//             std::string snfg_string = snfg.create_snfg(new_glycan, glycosite);
//             std::string glycosite_key = Sails::Utils::format_residue_from_site(glycosite, &structure);
//             telemetry.save_snfg(i, glycosite_key, snfg_string);

//             telemetry.save_state(i);
        }
    }

    std::cout << std::endl;

    // add links and write files
//     std::vector<Sails::LinkRecord> links = generate_link_records(&structure, &glycosites, &topology);

//     Sails::MTZ output_mtz = Sails::form_sails_mtz(*density.get_mtz(), "FP", "SIGFP");
//     std::string log_string = telemetry.format_log(&structure, &density, false).value();

//     Sails::Telemetry::SNFGCycleData snfgs = telemetry.get_snfgs();
    std::stringstream stream;
    write_cif_to_stream(stream, gemmi::make_mmcif_document(structure));
    return stream.str();
}