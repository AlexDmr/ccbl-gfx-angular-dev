import {HumanReadableProgram} from 'ccbl-js/lib/ProgramObjectInterface';

export interface ProgramVersion {
  id: string;
  programVersions: HumanReadableProgram[];
}

/*
  Un utilisateur :
    * Programs: une collection de ProgramVersion
    *
 */
