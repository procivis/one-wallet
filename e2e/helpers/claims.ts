import { CredentialSchemaResponseDTO } from '../types/credential';
import { DataType } from '../utils/enums';

export const getObjectClaim = () => {
  return {
    array: false,
    claims: [
      {
        array: false,
        datatype: DataType.STRING,
        key: 'Sub-name',
        required: true,
      },
    ],
    datatype: DataType.OBJECT,
    key: 'Object A',
    required: true,
  };
};

export const getSimpleClaims = () => {
  return [
    {
      array: false,
      datatype: DataType.STRING,
      key: 'Full name',
      required: true,
    },
  ];
};

export const getAttributeClaims = () => {
  return [
    {
      array: false,
      datatype: DataType.STRING,
      key: 'Attribute 1',
      required: true,
    },
    {
      array: false,
      datatype: DataType.STRING,
      key: 'Attribute 2',
      required: true,
    },
  ];
};

export const mDocCredentialClaims = (
  mdocSchema: CredentialSchemaResponseDTO,
) => {
  return [
    {
      claimId: mdocSchema.claims![2].claims![0].claims![0].id,
      path: 'Data/Categories/0/Category',
      value: 'A',
    },
    {
      claimId: mdocSchema.claims![2].claims![0].claims![1].id,
      path: 'Data/Categories/0/Expired',
      value: '2026-09-29T00:00:00.000Z',
    },
    {
      claimId: mdocSchema.claims![2].claims![0].claims![0].id,
      path: 'Data/Categories/1/Category',
      value: 'B',
    },
    {
      claimId: mdocSchema.claims![2].claims![0].claims![1].id,
      path: 'Data/Categories/1/Expired',
      value: '2030-09-30T00:00:00.000Z',
    },
    {
      claimId: mdocSchema.claims![2].claims![0].claims![0].id,
      path: 'Data/Categories/2/Category',
      value: 'C',
    },
    {
      claimId: mdocSchema.claims![2].claims![0].claims![1].id,
      path: 'Data/Categories/2/Expired',
      value: '2027-09-28T00:00:00.000Z',
    },
    {
      claimId: mdocSchema.claims![0].claims![0].id,
      path: 'Address/country',
      value: 'CH',
    },
    {
      claimId: mdocSchema.claims![0].claims![1].id,
      path: 'Address/region',
      value: 'Zurich',
    },
    {
      claimId: mdocSchema.claims![0].claims![2].id,
      path: 'Address/city',
      value: 'Zurich',
    },
    {
      claimId: mdocSchema.claims![0].claims![3].id,
      path: 'Address/street',
      value: 'strasse',
    },
    {
      claimId: mdocSchema.claims![1].claims![0].id,
      path: 'Credentials/first name',
      value: 'Wade',
    },
    {
      claimId: mdocSchema.claims![1].claims![1].id,
      path: 'Credentials/last name',
      value: 'Wilson',
    },
    {
      claimId: mdocSchema.claims![1].claims![2].id,
      path: 'Credentials/Birthday',
      value: '2018-01-17T00:00:00.000Z',
    },
    {
      claimId: mdocSchema.claims![1].claims![3].id,
      path: 'Credentials/image',
      value:
        'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
    },
  ];
};
