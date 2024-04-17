type ExternalLibraryExternalReference = {
  comment: string | null;
  type: 'documentation' | 'website' | 'vcs';
  url: string;
};

export type ExternalLibrary = {
  description: string;
  externalReferences: ExternalLibraryExternalReference[];
  licenses: string[];
  name: string;
  purl: string;
  type: string;
  version: string;
};

export type Licence = {
  id: string;
  isFsfLibre: boolean;
  isOsiApproved: boolean;
  licenseComments: string | null;
  licenseText: string;
  name: string;
  seeAlso: string[];
  uuid: string;
};

export type LibrariesLicences = {
  components: ExternalLibrary[];
  licences: Licence[];
};
