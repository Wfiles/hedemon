import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';

import IPFS from '@src/services/IPFS';
import { NFTMetadata } from '@utils/entity/NFT-Metadata';
import { TokenInfo } from '@utils/entity/TokenInfo';
import renderValue from '@utils/helpers/renderValue';
import { NFTInfo } from '@utils/entity/NFTInfo';
import { HEDERA_NETWORK } from '@src/../Global.d';
import HIP412MetadataSchema from '@src/utils/const/HIP412MetadataSchema';

import Loader from '@components/shared/loader/Loader';
import { IPFSImage } from '@src/components/shared/IPFSImage';

import placeholder from '@assets/images/placeholder.png';
import './nft.scss';

type NFTProps = NFTInfo & {
  collectionInfo?: TokenInfo
}

enum CardMessages {
  VALIDATION_WARNING = '',
  FETCHING_ERROR = 'Metadata loading error'
}

export default function NFT({ metadata, serial_number, collectionInfo }: NFTProps) {
  const [loadedMetadata, setLoadedMetadata] = useState<NFTMetadata | null>(null);
  const [message, setMessage] = useState<CardMessages | null>(null)
  const [isLoading, setIsLoading] = useState(true);

  const loadMetadata = useCallback(async () => {
    if (!metadata) {
      setIsLoading(false)
      return
    }

    try {
      const fetchedMetadata = await IPFS.fetchData(metadata)

      if (fetchedMetadata) {
        setLoadedMetadata(fetchedMetadata);
      }
      
      const metadataValidationResult = HIP412MetadataSchema.isValidSync(fetchedMetadata)
      
      if (!metadataValidationResult) {
        setMessage(CardMessages.VALIDATION_WARNING)
      }
    } catch {
      setMessage(CardMessages.FETCHING_ERROR)
    }

    setIsLoading(false);
  }, [metadata]);

  const nftCardClassnames = useMemo(() => (
    classNames('nft-card', { nft__isLoading: isLoading })
  ), [isLoading])

  const nftCardMessageClassNamees = useMemo(() => (
    classNames({
      'nft-card__message--warning': message === CardMessages.VALIDATION_WARNING,
      'nft-card__message--error': message === CardMessages.FETCHING_ERROR,
    })
  ), [message])

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <a
        href={`https://hashscan.io/${ HEDERA_NETWORK }/token/${ collectionInfo?.token_id }`}
        target='_blank'
        className={nftCardClassnames}
        style={{ width: '300px', height: '408px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isLoading ? (
          <div className='nft-card__loader'>
            <Loader />
          </div>
        ) : (
          <div className='nft-card__image' style={{ width: '100%', height: '100%' }}>
            {message && (
              <p className={nftCardMessageClassNamees}>{message}</p>
            )}

            {loadedMetadata && loadedMetadata.image ? (
              <IPFSImage
                cidOrUrlToImage={loadedMetadata.image}
                alt='nft_image_preview'
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <img
                className='placeholder'
                src={placeholder}
                alt='placeholder'
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>
        )}
      </a>
      <div className='nft-card__content' style={{ textAlign: 'center', marginTop: '10px' }}>
        <p className='nft-card__name' style={{ fontSize: '18px', fontWeight: 'bold' }}>
          {renderValue(loadedMetadata?.name, '(no name)')}
        </p>
        <p className='nft-card__collection-name' style={{ fontSize: '16px' }}>
          {collectionInfo?.name}
        </p>
      </div>
    </div>
  );
}
