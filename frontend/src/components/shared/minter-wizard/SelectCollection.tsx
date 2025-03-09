import React, { useContext, useEffect } from 'react';
import { useFormikContext } from 'formik';

import useHederaWallets from '@hooks/useHederaWallets';
import useHederaAccountNFTs from '@src/utils/hooks/useHederaAccountNFTs';
import { MinterWizardStepWrapperContext } from '@components/shared/minter-wizard/StepWrapper';
import { MinterWizardContext } from '@components/views/minter-wizard';

import WebcamCaptureModal from '@components/shared/modals/WebcamCaptureModal';

export default function SelectCollection() {
  const { userWalletId } = useHederaWallets();
  const { values, setFieldValue, resetForm, validateField } = useFormikContext();
  const { setNextButtonHidden } = useContext(MinterWizardStepWrapperContext);
  const { creatorStepToBackFromSummary } = useContext(MinterWizardContext);
  const { collections, loading, fetchHederaAccountNFTs } = useHederaAccountNFTs(userWalletId);

  useEffect(() => {
    setNextButtonHidden(!collections || loading || !userWalletId);
  }, [collections, loading, setNextButtonHidden, userWalletId]);

  useEffect(() => {
    if (!userWalletId) {
      resetForm({
        values: {
          ...(typeof values === 'object' ? values : {}),
          token_id: '',
        }
      });
      validateField('token_id');
    }
  }, [resetForm, userWalletId, validateField]);

  return <div><WebcamCaptureModal onClose={creatorStepToBackFromSummary} /></div>;
}
