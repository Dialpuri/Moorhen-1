#include <sails/sails-sequence.h>
#include <sails/sails-utils.h>

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

std::vector<SiteResult> find_sites(const std::string &file, const std::string &name) {
    char *c_data = (char *)file.c_str();
    size_t size = file.length();

    if (size == 0) {
        return {};
    }

    ::gemmi::Structure structure = ::gemmi::read_structure_from_char_array(c_data, size, name);
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