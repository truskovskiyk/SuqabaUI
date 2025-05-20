macro(SetupOpenCasCade)
    set(OpenCASCADE_DIR /usr/lib/cmake/opencascade)
    set(OpenCASCADE_INCLUDE_DIRS /usr/include/opencascade)
    find_package(OCC REQUIRED)
    if(NOT OCC_FOUND)
        message(FATAL_ERROR "================================================================\n"
                            "OpenCASCADE not found!\n"
                            "================================================================\n")
    endif()
endmacro()
