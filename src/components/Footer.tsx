import { FC } from 'react';

interface FooterProps {}

const Footer: FC<FooterProps> = () => {
  const year = new Date().getFullYear();
  return (
    <footer className='text-primaryLight bg-black pb-5 text-center text-xs font-light'>
      All Rights Reserved ©{year}
    </footer>
  );
};

export default Footer;
