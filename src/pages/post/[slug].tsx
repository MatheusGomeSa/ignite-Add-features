import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useEffect, useState } from 'react';
import { RichText } from 'prismic-reactjs';
import { useRouter } from 'next/router'


interface PostProps {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostsProps {
  PostPageInformations: PostProps;
}

export default function Post({ PostPageInformations }: PostsProps) {
  const [Timer, SetTimer] = useState(0)
  useEffect(() => {
    let words = [];
    PostPageInformations.data.content.forEach(infos => {
      var heading = infos.heading.split(' ')
      words = words.concat(heading);
      infos.body.forEach(body => {
        var bod = body.text.split(' ');
        words = words.concat(bod);
      })
    })
    SetTimer(Math.ceil(words.length / 200));

  })

  const [Infos, SetInfos] = useState(PostPageInformations);

  const router = useRouter();

  if (router.isFallback) {
    return (
      <h1>Carregando...</h1>
    )
  }

  return (<>
    <img src={PostPageInformations.data.banner.url} alt="banner" className={styles.banner} />
    <div className={styles.content}>
      <main >
        <h1>{Infos.data.title}</h1>
        <div>
          <FiCalendar /> {format(new Date(PostPageInformations.first_publication_date), 'dd MMM yyyy')}
          <FiUser /> {Infos.data.author}
          <FiClock /> {Timer} min
        </div>
        {Infos.data.content.map(content => {
          return (<>
            <h3>{content.heading}</h3>
            {content.body.map(body => {
              return <p>{body.text}</p>
            }
            )}
          </>
          )
        })}
      </main>
    </div>
  </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.slug', 'posts.subtitle', 'posts.author', 'posts.banner', 'posts.content'],
      pageSize: 3,
    })

  let slugs = []
  posts.results.forEach(post => {
    slugs.push(post.uid);
  })
  let parameter = []
  slugs.forEach(slug => {
    parameter.push({ params: { slug: slug } })
  })
  return {
    paths: parameter,
    fallback: true
  }

};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient();
  let response = await prismic.getByUID('posts', String(slug), {});

  let PostPageInformations = {
    first_publication_date: response.first_publication_date,
    data: {
      title: RichText.asText(response.data.title),
      banner: {
        url: response.data.banner.url
      },
      author: RichText.asText(response.data.author),
      content: response.data.content.map((content) => {
        return {
          heading: content.heading,
          body: content.body.map((body) => {
            return { text: body.text }
          }

          )
        }
      })
    }
  }
  return {
    props: {
      PostPageInformations
    },
    redirect: 60 * 60 // 1 hora
  }

};
