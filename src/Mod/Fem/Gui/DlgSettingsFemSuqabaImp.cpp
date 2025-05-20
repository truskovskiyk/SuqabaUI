/***************************************************************************
 *   Copyright (c) 2021 FreeCAD Developers                                 *
 *   Author: Bernd Hahnebach <bernd@bimstatik.ch>                          *
 *   Based on src/Mod/Fem/Gui/DlgSettingsFemGeneralImp.cpp                 *
 *                                                                         *
 *   This file is part of the FreeCAD CAx development system.              *
 *                                                                         *
 *   This library is free software; you can redistribute it and/or         *
 *   modify it under the terms of the GNU Library General Public           *
 *   License as published by the Free Software Foundation; either          *
 *   version 2 of the License, or (at your option) any later version.      *
 *                                                                         *
 *   This library  is distributed in the hope that it will be useful,      *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         *
 *   GNU Library General Public License for more details.                  *
 *                                                                         *
 *   You should have received a copy of the GNU Library General Public     *
 *   License along with this library; see the file COPYING.LIB. If not,    *
 *   write to the Free Software Foundation, Inc., 59 Temple Place,         *
 *   Suite 330, Boston, MA  02111-1307, USA                                *
 *                                                                         *
 ***************************************************************************/

#include "PreCompiled.h"
#ifndef _PreComp_
#include <QMessageBox>
#endif

#include "DlgSettingsFemSuqabaImp.h"
#include "ui_DlgSettingsFemSuqaba.h"


using namespace FemGui;

DlgSettingsFemSuqabaImp::DlgSettingsFemSuqabaImp(QWidget* parent)
    : PreferencePage(parent)
    , ui(new Ui_DlgSettingsFemSuqabaImp)
{
    ui->setupUi(this);

    connect(ui->fc_suqaba_binary_path,
            &Gui::PrefFileChooser::fileNameChanged,
            this,
            &DlgSettingsFemSuqabaImp::onfileNameChanged);
}

DlgSettingsFemSuqabaImp::~DlgSettingsFemSuqabaImp() = default;

void DlgSettingsFemSuqabaImp::saveSettings()
{
    ui->cb_suqaba_binary_std->onSave();
    ui->fc_suqaba_binary_path->onSave();
    ui->cb_suqaba_write_comments->onSave();
}

void DlgSettingsFemSuqabaImp::loadSettings()
{
    ui->cb_suqaba_binary_std->onRestore();
    ui->fc_suqaba_binary_path->onRestore();
    ui->cb_suqaba_write_comments->onRestore();
}

/**
 * Sets the strings of the subwidgets using the current language.
 */
void DlgSettingsFemSuqabaImp::changeEvent(QEvent* e)
{
    if (e->type() == QEvent::LanguageChange) {
        ui->retranslateUi(this);
    }
    else {
        QWidget::changeEvent(e);
    }
}

void DlgSettingsFemSuqabaImp::onfileNameChanged(QString FileName)
{
    if (!QFileInfo::exists(FileName)) {
        QMessageBox::critical(this,
                              tr("File does not exist"),
                              tr("The specified executable\n'%1'\n does not exist!\n"
                                 "Specify another file please.")
                                  .arg(FileName));
    }
}

#include "moc_DlgSettingsFemSuqabaImp.cpp"
