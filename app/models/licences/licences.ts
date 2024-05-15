type ExternalLibraryExternalReference = {
  comment: string | null;
  type: 'documentation' | 'website' | 'vcs' | 'other';
  url: string;
};

export type ExternalLibrary = {
  description: string | null;
  externalReferences: ExternalLibraryExternalReference[] | null;
  licenses: string[];
  name: string;
  purl: string;
  type: 'library' | 'framework';
  version: string;
};

export type Licence = {
  licenseId: string;
  licenseText: string;
  name: string;
  seeAlso: string[];
};

export type LibrariesLicences = {
  components: ExternalLibrary[];
  licences: Licence[];
};
