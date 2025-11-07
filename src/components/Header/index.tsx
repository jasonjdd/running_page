import { Link } from 'react-router-dom';
import useSiteMetadata from '@/hooks/useSiteMetadata';
import { WEEK_STATISTIC_MESSAGE } from '@/utils/const';

const Header = () => {
  const { logo, siteUrl, navLinks } = useSiteMetadata();

  return (
    <>
      <nav className="mt-12 flex w-full items-center justify-between pl-6 lg:px-16">
        <div className="w-1/4">
          <Link to={siteUrl}>
            <picture>
              <img className="h-16 w-16 rounded-full" alt="logo" src={logo} />
            </picture>
          </Link>
        </div>
        <div className="w-1/4">
          {/* 第一行: 本周跑步统计数据 */}
          <div className="font-semibold text-gray-800">
            {WEEK_STATISTIC_MESSAGE(3, 46, 133, '6m/km')}
          </div>

          {/* 第二行: 本月跑步记录统计数据 */}
          <div className="text-gray-500">
            本月跑步: 3 次
          </div>
        </div>
        <div className="w-2/4 text-right">
          {navLinks.map((n, i) => (
            <a
              key={i}
              href={n.url}
              className="mr-3 text-lg lg:mr-4 lg:text-base"
            >
              {n.name}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Header;
