import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText, RichTextBlock } from 'prismic-reactjs';
import Link from 'next/link';

import Header from '../components/Header';
import { Console, info } from 'console';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }) {
  const [resultPostPagination, setResultPostPagination] = useState<PostPagination>({
    next_page: postsPagination.next_page,
    results: postsPagination.results.map(posts => {
      return {
        uid: String(posts.uid),
        first_publication_date: posts.first_publication_date,
        data: {
          title: typeof posts.data.title == 'string' ? posts.data.title : RichText.asText(posts.data.title),
          subtitle: typeof posts.data.subtitle == 'string' ? posts.data.subtitle : RichText.asText(posts.data.subtitle),
          author: typeof posts.data.author == 'string' ? posts.data.author : RichText.asText(posts.data.author)
        }
      }
    })
  });
  async function NextPage() {
    const newpage = await window.fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(data => {
        let informations = data.results.map(Newresult => {
          return {
            uid: String(Newresult.uid),
            first_publication_date: Newresult.first_publication_date,
            data: {
              title: typeof Newresult.data.title == 'string' ? Newresult.data.title : RichText.asText(Newresult.data.title),
              subtitle: typeof Newresult.data.subtitle == 'string' ? Newresult.data.subtitle : RichText.asText(Newresult.data.subtitle),
              author: typeof Newresult.data.author == 'string' ? Newresult.data.author : RichText.asText(Newresult.data.author)
            }
          }
        });

        return {
          next_page: data.next_page,
          results: informations
        }
      })
    let result = resultPostPagination.results.concat(newpage.results)
    setResultPostPagination({
      next_page: newpage.next_page,
      results: result
    })

  }
  return (
    <>
      <header className={styles.header}>
      </header>
      <div className={styles.container}>
        <main className={styles.post} >
          {resultPostPagination.results.map((result) =>
          (
            <a key={result.uid} href={`/post/${result.uid}`}>
              <section className={styles.post}>
                {result.data.title}
                <div className={styles.infos}>
                  <p>{result.data.subtitle}</p>
                  <p><FiCalendar /> <p>{format(new Date(result.first_publication_date), 'dd MMM yyyy', { locale: ptBR }).toLowerCase()}</p>
                    <FiUser /> <p>{result.data.author}</p></p>
                </div>
              </section>
            </a>)

          )}
          {resultPostPagination.next_page ?
            <a className={styles.loader} onClick={NextPage}>Carregar mais posts</a> : ""}
        </main>
      </div>

    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1,
  })

  const posts: Post[] = postsResponse.results.map(post => {
    return {
      uid: String(post.uid),
      first_publication_date: post.first_publication_date,
      data: {
        title: typeof post.data.title == 'string' ? post.data.title : RichText.asText(post.data.title),
        subtitle: typeof post.data.subtitle == 'string' ? post.data.subtitle : RichText.asText(post.data.subtitle),
        author: typeof post.data.author == 'string' ? post.data.author : RichText.asText(post.data.author)
      }

    }
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    }
  }

}
