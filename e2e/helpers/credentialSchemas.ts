import { CredentialSchemaResponseDTO } from '../types/credential';
import { CredentialSchemaData } from '../types/credentialSchema';
import { createCredentialSchema } from '../utils/bff-api';
import {
  CodeType,
  CredentialFormat,
  DataType,
  LayoutType,
  RevocationMethod,
} from '../utils/enums';
import { shortUUID } from '../utils/utils';

export const mDocCredentialSchema = async (authToken: string) => {
  const uuid = shortUUID();
  const claims = [
    {
      array: false,
      claims: [
        {
          array: false,
          datatype: DataType.STRING,
          key: 'country',
          required: true,
        },
        {
          array: false,
          datatype: DataType.STRING,
          key: 'region',
          required: true,
        },
        {
          array: false,
          datatype: DataType.STRING,
          key: 'city',
          required: true,
        },
        {
          array: false,
          datatype: DataType.STRING,
          key: 'street',
          required: true,
        },
      ],
      datatype: DataType.OBJECT,
      key: 'Address',
      required: true,
    },
    {
      array: false,
      claims: [
        {
          array: false,
          datatype: DataType.STRING,
          key: 'first name',
          required: true,
        },
        {
          array: false,
          datatype: DataType.STRING,
          key: 'last name',
          required: true,
        },
        {
          array: false,
          datatype: DataType.BIRTH_DATE,
          key: 'Birthday',
          required: true,
        },
        {
          array: false,
          datatype: DataType.MDL_PICTURE,
          key: 'image',
          required: true,
        },
      ],
      datatype: DataType.OBJECT,
      key: 'Credentials',
      required: true,
    },
    {
      array: false,
      claims: [
        {
          array: true,
          claims: [
            {
              array: false,
              datatype: DataType.STRING,
              key: 'Category',
              required: true,
            },
            {
              array: false,
              datatype: DataType.DATE,
              key: 'Expired',
              required: true,
            },
          ],
          datatype: DataType.OBJECT,
          key: 'Categories',
          required: true,
        },
      ],
      datatype: DataType.OBJECT,
      key: 'Data',
      required: true,
    },
  ];
  const data: CredentialSchemaData = {
    claims: claims,
    format: CredentialFormat.MDOC,
    layoutProperties: {
      background: {
        color: '#375548',
      },
      code: {
        attribute: 'Address/city',
        type: CodeType.QrCode,
      },
      logo: {
        backgroundColor: '#77722a',
        fontColor: '#b23d3d',
      },
      pictureAttribute: 'Credentials/image',
      primaryAttribute: 'Credentials/first name',
      secondaryAttribute: 'Credentials/last name',
    },
    layoutType: LayoutType.CARD,
    name: `Driver's license ${uuid}`,
    revocationMethod: RevocationMethod.NONE,
    schemaId: `org.iso.18013.5.1.mDL-${uuid}`,
  };
  return await createCredentialSchema(authToken, data, false);
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
