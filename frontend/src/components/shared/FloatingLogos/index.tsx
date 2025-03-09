import React, { useMemo, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import CSSTransition from 'react-transition-group/CSSTransition';
import SwitchTransition from 'react-transition-group/SwitchTransition';
import classNames from 'classnames';
import { HomepageContext } from '@utils/context/HomepageContext';

export default function Footer() {
  const location = useLocation();
  const { isMinterWizardWelcomeScreen } = useContext(HomepageContext);

  const showLogoOnRightSide = useMemo(() => {
    if (location.pathname === '/') {
      return !isMinterWizardWelcomeScreen;
    }
    return true;
  }, [location.pathname, isMinterWizardWelcomeScreen]);

  const footerLogoAnimationClassnames = useMemo(
    () => classNames(`fadeslide${showLogoOnRightSide ? '-left' : '-right'}`),
    [showLogoOnRightSide]
  );

  return (
    <footer className='footer'>
      <SwitchTransition>
        <CSSTransition
          key={showLogoOnRightSide ? 'right' : 'left'}
          addEndListener={(node, done) => node.addEventListener('transitionend', done, false)}
          timeout={500}
          classNames={footerLogoAnimationClassnames}
        >
          {/* Removed Hedera Logo */}
          <div></div>
        </CSSTransition>
      </SwitchTransition>
    </footer>
  );
}
