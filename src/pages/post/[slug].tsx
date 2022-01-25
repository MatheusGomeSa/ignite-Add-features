import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useEffect, useState } from 'react';
import { RichText, RichTextBlock } from 'prismic-reactjs';
import { useRouter } from 'next/router'
import { Comments } from '../../components/Comments';

interface NavagationPost {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  prevPage: NavagationPost | null;
  post: Post;
  nextPage: NavagationPost | null;
}

export default function Post({ prevPage, post, nextPage }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <h1>Carregando...</h1>
    )
  }

  const [Infos, SetInfos] = useState({
    first_publication_date: post.first_publication_date,
    last_publication_date: post.last_publication_date,
    data: {
      title: typeof post.data.title == 'string' ? post.data.title : RichText.asText(post.data.title),
      banner: {
        url: post.data.banner.url
      },
      author: typeof post.data.author == 'string' ? post.data.author : RichText.asText(post.data.author),
      content: post.data.content.map((content) => {
        return {
          heading: content.heading,
          body: content.body
        }
      })
    }
  });
  //console.log(JSON.stringify(Infos, null, 2))
  const [Timer, SetTimer] = useState(0)
  useEffect(() => {
    let words = [];
    Infos.data.content.forEach(infos => {
      var heading = infos.heading.split(' ')
      var bod = RichText.asText(infos.body).split(' ');
      words = words.concat(heading);
      words = words.concat(bod);
    })
    SetTimer(Math.ceil(words.length / 200));

  })

  return (<>
    <img src={Infos.data.banner.url} alt="banner" className={styles.banner} />
    <div className={styles.content}>
      <main >
        <h1>{Infos.data.title}</h1>
        <div className={styles.footerinfos}>
          <div><FiCalendar /> <p>{format(new Date(Infos.first_publication_date), 'dd MMM yyyy').toLocaleLowerCase()}</p></div>
          <div><FiUser /> <p>{Infos.data.author}</p></div>
          <div><FiClock /> <p>{Timer} min</p></div>
          <em>*editado em {format(new Date(Infos.last_publication_date), 'dd MMM yyyy', { locale: ptBR })}, às {format(new Date(Infos.last_publication_date), 'HH:mm', { locale: ptBR })}</em>
        </div>
        {Infos.data.content.map(content => {
          return (<>
            <h3>{content.heading}</h3>
            {RichText.render(content.body)}
          </>
          )
        })}
      </main>
      <footer>
        <div>
          <div>
            {prevPage ?
              <>
                <p>{RichText.asText(prevPage.data.title)}</p>
                <a href={`/post/${prevPage.uid}`}>Post anterior</a></> : ""}
          </div>
          <div>
            {nextPage ?
              <>
                <p>{RichText.asText(nextPage.data.title)}</p>
                <a href={`/post/${nextPage.uid}`}>Próximo post</a></> : ""}
          </div>
        </div>
        <Comments />
      </footer>
    </div>
  </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.slug', 'posts.title', 'posts.subtitle', 'posts.author', 'posts.banner', 'posts.content'],
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

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.uid', 'posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 10,

  })

  postsResponse.results.sort(function (a, b) {
    let x = new Date(a.first_publication_date).getTime(),
      y = new Date(b.first_publication_date).getTime();
    return x - y;
  })


  let ObjectProps = { PrevPage: {}, Post: {}, NextPage: {}, }

  for (let i = 0; i < postsResponse.results.length; i++) {
    if (postsResponse.results[i].uid == String(slug)) {
      ObjectProps.PrevPage = postsResponse.results[i - 1];
      ObjectProps.NextPage = postsResponse.results[i + 1];
    }
  }
  // console.log(JSON.stringify(ObjectProps, null, 2));

  let response = await prismic.getByUID('posts', String(slug), {});


  let post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map((content) => {
        return {
          heading: content.heading,
          body: content.body
        }
      })
    }
  }
  ObjectProps.Post = post;
  // console.log(JSON.stringify(post))
  return {
    props: {
      nextPage: ObjectProps.NextPage || null,
      post: post,
      prevPage: ObjectProps.PrevPage || null
    }



    /* let PostPageInformations = {
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
      }
   */
    ,
    redirect: 60 * 60 // 1 hora
  }

};
