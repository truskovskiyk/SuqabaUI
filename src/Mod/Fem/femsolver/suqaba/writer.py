# ***************************************************************************
# *   Copyright (c) 2017 Bernd Hahnebach <bernd@bimstatik.org>              *
# *                                                                         *
# *   This file is part of the FreeCAD CAx development system.              *
# *                                                                         *
# *   This program is free software; you can redistribute it and/or modify  *
# *   it under the terms of the GNU Lesser General Public License (LGPL)    *
# *   as published by the Free Software Foundation; either version 2 of     *
# *   the License, or (at your option) any later version.                   *
# *   for detail see the LICENCE text file.                                 *
# *                                                                         *
# *   This program is distributed in the hope that it will be useful,       *
# *   but WITHOUT ANY WARRANTY; without even the implied warranty of        *
# *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         *
# *   GNU Library General Public License for more details.                  *
# *                                                                         *
# *   You should have received a copy of the GNU Library General Public     *
# *   License along with this program; if not, write to the Free Software   *
# *   Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  *
# *   USA                                                                   *
# *                                                                         *
# ***************************************************************************

__title__ = "Suqaba writer object for FreeCAD FEM"
__author__ = "Clément Vella"
__SqbUrl__ = "https://www.suqaba.com"
__FcUrl__ = "https://www.freecad.org"

## \addtogroup FEM
#  @{

import time
import re
import pathlib
from os.path import join

import FreeCAD
import Part

from .. import writerbase

    
class FemInputWriterSuqaba(writerbase.FemInputWriter):
    def __init__(self, task_print, analysis_obj, solver_obj, member, dir_name=None):
        writerbase.FemInputWriter.__init__(self,
                                           analysis_obj,
                                           solver_obj,
                                           None, # mesh is None
                                           member,
                                           dir_name)
        self.print = task_print
        self.basename = pathlib.Path(solver_obj.Document.FileName).stem
        self.phgrname = ""
        self.partname = ""
        self.geoname  = "{}.geo".format(self.basename)
        self.jsonname = "{}.json".format(self.basename)
        self.json_string = ""
        self.faces_of_part = {}

        self.solid_tags = []


    def write_solver_input(self):
        timestart = time.process_time()
        self.print("Input filename: {}\n".format(self.jsonname))
        self.print("Writing Suqaba input files to: {}\n".format(self.dir_name))
        
        self.export_body_to_step()

        self.json_string += "{\n"        
        self.write_suqaba_parameters()
        self.write_suqaba_unique_material()
        self.write_suqaba_dirichlet()
        self.write_suqaba_neumann()
        self.write_suqaba_centrif_load()
        self.write_gmsh_geo_file()
        self.json_string += "}\n\n"

        with open("{}/{}".format(self.dir_name, self.jsonname), "w") as f:
            f.write(self.json_string)

        timeend = round((time.process_time() - timestart), 2)
        self.print("Writing time input file: {} seconds\n\n".format(timeend))
        
        return self.dir_name
    

    def export_body_to_step(self):
        body = FreeCAD.ActiveDocument.findObjects("PartDesign::Body")[0]
        self.phgrname = body.Label
        self.partname = "{}.brep".format(self.basename)
        body.Shape.exportBrep("{}/{}".format(self.dir_name, self.partname))
    

    # def export_part_to_step(self):
    #     part = FreeCAD.ActiveDocument.findObjects("App::Part")[0]
    #     self.partname = part.Label
    #     shapes = []
    #     tag = 1
    #     for obj in part.OutList:
    #         if obj.isDerivedFrom("Part::Feature"):
    #             shapes.append(obj.Shape)

    #             n_faces = len(obj.Shape.Faces)
    #             face_tags = [i + tag for i in range(n_faces)]
    #             tag += n_faces
    #             self.faces_of_part[obj] = face_tags

    #     compound = Part.makeCompound(shapes)
    #     self.partname = "{}/{}.stp".format(self.dir_name, self.partname)
    #     compound.exportStep(self.partname)


    def write_gmsh_geo_file(self):
        geo_string = ""
        separator  = ", "

        with open("{}/{}".format(self.dir_name, self.geoname), "w") as f:
            geo_string += "Merge \"{}\";\n".format(self.partname)
            geo_string += (
                "Physical Volume(\"{PHGR_NAME}\") = {{{SOLID_TAG}"
            ).format(PHGR_NAME=self.phgrname, SOLID_TAG=self.solid_tags[0])
            for tag in self.solid_tags[1:]:
                geo_string += ", {SOLID_TAG}".format(SOLID_TAG=tag)
            geo_string += "};\n"

            if self.block_dict:
                for key, value in self.block_dict.items():
                    geo_string += "Physical Surface(\"{}\") = {{".format(key)
                    geo_string += separator.join(value)
                    geo_string += "};\n"

            if self.neum_dict:
                for key, value in self.neum_dict.items():
                    geo_string += "Physical Surface(\"{}\") = {{".format(key)
                    geo_string += separator.join(value)
                    geo_string += "};\n"
                
                geo_string +="\n"

            f.write(geo_string)
    

    def write_suqaba_unique_material(self):
        mat_obj = self.member.mats_linear[0]["Object"]
        volume_force = self.member.cons_selfweight
        
        self.solid_tags = [1] # unique volume

        young_mod   = FreeCAD.Units.Quantity(mat_obj.Material["YoungsModulus"]).getValueAs("MPa")
        poisson_rat = float(mat_obj.Material["PoissonRatio"])
        density     = FreeCAD.Units.Quantity(mat_obj.Material["Density"]).getValueAs("1000kg/mm^3")

        fvol = [0., 0., 0.]
        if volume_force:
            force_obj = volume_force[0]["Object"]
            gravity_c = FreeCAD.Units.Quantity(force_obj.GravityAcceleration).getValueAs("mm/s^2")
            gravity_v = force_obj.GravityDirection
            
            for i in range(3):
                fvol[i] = density * gravity_c * gravity_v[i]

        self.json_string += (
            "    \"PHYSICAL_GROUPS_3D\": [\n"
            "        {{\n"
            "           \"name\"   : \"{PHGR_NAME}\",\n"
            "           \"young_modulus\": {YOUNG_MOD},\n"
            "           \"poisson_ratio\": {POISSON_RAT},\n"
            "           \"load_fx\": {{\n"
            "                \"x\": \"{FX}\",\n"
            "                \"y\": \"{FY}\",\n"
            "                \"z\": \"{FZ}\"\n"
            "           }}\n"
            "        }}\n"
            "    ],\n"
        ).format(PHGR_NAME=self.phgrname,
                 YOUNG_MOD=young_mod,
                 POISSON_RAT=poisson_rat,
                 FX=fvol[0],
                 FY=fvol[1],
                 FZ=fvol[2])
    

    def write_suqaba_materials(self):
        mat_dict = self.member.mats_linear[0]

        for i, _ in enumerate(mat_dict["Object"].References):
            self.solid_tags.append(i + 1)

        young_mod   = FreeCAD.Units.Quantity(mat_dict["Object"].Material["YoungsModulus"]).getValueAs("MPa")
        poisson_rat = float(mat_dict["Object"].Material["PoissonRatio"])

        self.json_string += (
            "    \"PHYSICAL_GROUPS_3D\": [\n"
            "        {{\n"
            "           \"name\"   : \"{PHGR_NAME}\",\n"
            "           \"young_modulus\": {YOUNG_MOD},\n"
            "           \"poisson_ratio\": {POISSON_RAT},\n"
            "           \"load_fx\": {{\n"
            "                \"x\": \"0\",\n"
            "                \"y\": \"0\",\n"
            "                \"z\": \"0\"\n"
            "           }}\n"
            "        }}\n"
            "    ],\n"
        ).format(PHGR_NAME=self.partname,
                 YOUNG_MOD=young_mod,
                 POISSON_RAT=poisson_rat)


    def write_suqaba_dirichlet(self):
        blocks = self.member.cons_fixed
        self.block_dict = {}

        if blocks:
            self.json_string += "    \"DIRICHLET\": [\n"
            block_inputs = []
            separator = ",\n"

            for block in blocks:
                block_obj = block["Object"]
                label     = block_obj.Label

                self.block_dict[label] = []

                for obj in block_obj.References:
                    for entity in obj[1]:
                        face_tag = self.get_tag(entity)
                        self.block_dict[label].append(face_tag)
                
                block_inputs.append("        \"{}\"".format(label))
            
            self.json_string += separator.join(block_inputs)
            self.json_string += "\n    ],\n"
        
    
    def write_suqaba_neumann(self):
        separator = ",\n"
        neuma_str = ""
        self.neum_dict = {}
        neum_inputs = []

        forces = self.member.cons_force
        if forces:
            for force in forces:
                force_obj     = force["Object"]
                direction_vec = force_obj.DirectionVector
                force_mag     = force_obj.Force.getValueAs("N")
                label         = force_obj.Label
                area          = 0.

                self.neum_dict[label] = []

                for obj in force_obj.References:
                    for entity in obj[1]:
                        face_tag = self.get_tag(entity)
                        self.neum_dict[label].append(face_tag)
                        area += obj[0].Shape.Faces[int(face_tag) - 1].Area # abstraktcv: mm^2

                neum_inputs.append((
                        "        {{\n"
                        "            \"name\"   : \"{LABEL}\",\n"
                        "            \"load_fx\": {{\n"
                        "                \"x\": \"{FX}\",\n"
                        "                \"y\": \"{FY}\",\n"
                        "                \"z\": \"{FZ}\"\n"
                        "            }}\n"
                        "        }}"
                    ).format(LABEL=label,
                             FX=direction_vec.x * force_mag / area,
                             FY=direction_vec.y * force_mag / area,
                             FZ=direction_vec.z * force_mag / area))
                
        pressures = self.member.cons_pressure
        if pressures:
            for pressure in pressures:
                pressure_obj = pressure["Object"]
                label        = pressure_obj.Label
                if pressure_obj.Reversed:
                    pressure_mag = - pressure_obj.Pressure.getValueAs("MPa")
                else:
                    pressure_mag = pressure_obj.Pressure.getValueAs("MPa")

                self.neum_dict[label] = []

                for obj in pressure_obj.References:
                    for entity in obj[1]:
                        face_tag = self.get_tag(entity)
                        self.neum_dict[label].append(face_tag)

                neum_inputs.append((
                        "        {{\n"
                        "            \"name\"   : \"{LABEL}\",\n"
                        "            \"load_fx\": {{\n"
                        "                \"p\": \"{P}\"\n"
                        "            }}\n"
                        "        }}"
                    ).format(LABEL=label,
                             P=pressure_mag))
        
        self.json_string += "{}{}{}".format("    \"NEUMANN\": [\n",
                                            separator.join(neum_inputs),
                                            "\n    ]\n")
    

    def write_suqaba_centrif_load(self):
        pass


    def write_suqaba_parameters(self):
        self.json_string += (
            "    \"OMP\"           : 4,\n"
            "    \"ERROR\"         : {ERR},\n"
            "    \"REFI_STEPS\"    : 7,\n"
            "    \"JOBNAME\"       : \"{JOBNAME}\",\n"
        ).format(ERR=self.solver_obj.ErrorThreshold / 100,
                 JOBNAME=self.basename)
    

    @staticmethod
    def get_tag(label):
        match = re.search(r'\d+', label)
        return match.group()

##  @}
