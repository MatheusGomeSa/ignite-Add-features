import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom'
import Link from 'next/link';

import Header from '../components/Header';
import { Console } from 'console';
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

export default function Home({ postsPagination }: HomeProps) {
  const [resultPostPagination, setResultPostPagination] = useState<PostPagination>(postsPagination);
  async function NextPage() {
    const newpage: PostPagination = await window.fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(data => {
        let info = data.results.map(Newresult => {
          return {
            uid: String(Newresult.uid),
            first_publication_date: Newresult.first_publication_date,
            data: {
              title: RichText.asText(Newresult.data.title),
              subtitle: RichText.asText(Newresult.data.subtitle),
              author: RichText.asText(Newresult.data.author)
            }
          }
        });

        return {
          next_page: data.next_page,
          results: info
        }
      })
    let result = resultPostPagination.results.concat(newpage.results)
    setResultPostPagination({
      next_page: newpage.next_page,
      results: result,
    })

  }
  return (
    <>
      <header className={styles.header}>
        <Link href="/">
          <a>
            <img src="/assets/Logo.svg" alt='logo' />
          </a>
        </Link>
      </header>
      <div className={styles.container}>
        <main className={styles.post} >
          {resultPostPagination.results.map(result => (
            <Link key={result.uid} href={`/post/${result.uid}`}>
              <a>
                <section className={styles.post}>
                  <h1>{result.data.title}</h1>
                  <div className={styles.infos}>
                    <p>{result.data.subtitle}</p>
                    <p><FiCalendar /> {format(new Date(result.first_publication_date), 'dd MMM yyyy', { locale: ptBR })}
                      <FiUser /> {result.data.author}</p>
                  </div>
                </section>
              </a>
            </Link>
          ))}
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
        title: RichText.asText(post.data.title),
        subtitle: RichText.asText(post.data.subtitle),
        author: RichText.asText(post.data.author)
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
