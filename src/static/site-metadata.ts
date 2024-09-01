interface ISiteMetadataResult {
  siteTitle: string;
  siteUrl: string;
  description: string;
  logo: string;
  navLinks: {
    name: string;
    url: string;
  }[];
}

const data: ISiteMetadataResult = {
  siteTitle: 'Jason.Jia Running Page',
  siteUrl: 'https://jasonjdd.github.io/running_page',
  logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTtc69JxHNcmN1ETpMUX4dozAgAN6iPjWalQ&usqp=CAU',
  description: 'Personal site and blog',
  navLinks: [
    {
      name: 'Blog',
      url: 'https://jasonjdd.github.io/running_page',
    },
    {
      name: 'About',
      url: 'https://jasonjdd.github.io/running_page',
    },
  ],
};

export default data;
