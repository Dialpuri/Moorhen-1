cmake_minimum_required(VERSION 3.15...3.26)

set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_STANDARD 17)
#set(CMAKE_VERBOSE_MAKEFILE ON)
project(sails LANGUAGES CXX)
#set(CMAKE_CXX_FLAGS_RELEASE "-O3")
#set(CMAKE_C_COMPILER "gcc")
#set(CMAKE_CXX_COMPILER "/usr/bin/g++")
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

if (WIN32)
    set(CMAKE_BUILD_TYPE Release)
    set(CMAKE_GENERATOR_PLATFORM x64)
endif()

if (SKBUILD)
    find_package(ZLIB REQUIRED)
endif ()

set(CMAKE_CXX_FLAGS_RELEASE "-O3")

set(WRK_DIR "../checkout/Sails/package/")

include_directories(
        ${CMAKE_CURRENT_SOURCE_DIR}
        ${clipper-dependencies_SOURCE_DIR}
        ${gemmi-dependencies_SOURCE_DIR}/include
        ${mmdb2-dependencies_SOURCE_DIR}
)

link_directories(
        ${CMAKE_BINARY_DIR}/mmdb2
        ${CMAKE_BINARY_DIR}/clipper
        ${CMAKE_BINARY_DIR}/ccp4
        ${WRK_DIR}/src
        ${CMAKE_BINARY_DIR}
)

add_library(
        sails
        STATIC
        # Source
        ${WRK_DIR}/src/cpp/sails-json.cpp
        ${WRK_DIR}/src/cpp/sails-vector.cpp
        ${WRK_DIR}/src/cpp/sails-sequence.cpp
        ${WRK_DIR}/src/cpp/sails-topology.cpp
        ${WRK_DIR}/src/cpp/sails-glycan.cpp
        ${WRK_DIR}/src/cpp/sails-linkage.cpp
        ${WRK_DIR}/src/cpp/sails-utils.cpp
        ${WRK_DIR}/src/cpp/sails-refine.cpp
        ${WRK_DIR}/src/cpp/sails-cif.cpp
        ${WRK_DIR}/src/cpp/sails-dot.cpp
        ${WRK_DIR}/src/cpp/sails-telemetry.cpp
        ${WRK_DIR}/src/cpp/sails-solvent.cpp
        ${WRK_DIR}/src/cpp/sails-wurcs.cpp

        ${WRK_DIR}/src/cpp/sails-morph.cpp
        # Density
        ${WRK_DIR}/src/cpp/density/sails-density.cpp
        ${WRK_DIR}/src/cpp/density/sails-xtal-density.cpp
        ${WRK_DIR}/src/cpp/density/sails-em-density.cpp

        # SNFG
        ${WRK_DIR}/src/cpp/snfg/sails-snfg.cpp
        ${WRK_DIR}/src/cpp/snfg/sails-snfg-shape.cpp
        ${WRK_DIR}/src/cpp/snfg/shapes/circle.cpp
        ${WRK_DIR}/src/cpp/snfg/shapes/square.cpp
        ${WRK_DIR}/src/cpp/snfg/shapes/rectangle.cpp
        ${WRK_DIR}/src/cpp/snfg/shapes/triangle.cpp
        ${WRK_DIR}/src/cpp/snfg/shapes/diamond.cpp

        # Bindings
        ${WRK_DIR}/src/bindings/sails-gemmi-bindings.cpp

        # Third Party
        ${WRK_DIR}/src/third-party/simdjson.cpp
)

set(LINK_LIBS "gemmi_cpp sails ccp4 fftw rfftw mmdb2 clipper-mmdb clipper-cif clipper-core clipper-contrib clipper-minimol clipper-ccp4 clipper-gemmi")

target_link_directories(sails PUBLIC ../mmdb2 ../clipper/cif ../clipper/mmdb ../clipper/core ../clipper/contrib ../clipper/ccp4 ../clipper/gemmi ../fftw ../rfftw ../ccp4 ../gemmi)
target_link_libraries(sails mmdb2 clipper-mmdb clipper-cif clipper-core clipper-contrib clipper-ccp4 clipper-gemmi gemmi_cpp fftw rfftw ccp4 nodefs.js)
file(GLOB sails_HEADERS ${WRK_DIR}/src/include/*.h)

install(TARGETS sails
    LIBRARY DESTINATION lib
    PUBLIC_HEADER DESTINATION include/sails
)
