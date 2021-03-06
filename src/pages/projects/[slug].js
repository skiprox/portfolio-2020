import { useState, useEffect } from 'react';
// the data
import { getProjects } from 'lib/api';
// The modules
import { useRouter } from 'next/router';
import Link from 'next/link';
import ErrorPage from 'next/error';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import classnames from 'classnames';
import ReactGA from 'react-ga';
// The components
import Layout from 'components/Layout';
import AnimationContainer from 'components/modules/animationContainer';

export default function Project({slug, projects}) {
  const [preview, setPreview] = useState(false);
  const [walkArr] = useState([-2, -1, 0, 1, 2, 1, 0, -1]);
  const [data, setData] = useState(projects);
  // Get the data for our item
  const dataArr = data.filter(item => {
    return item.fields.slug === slug.slug;
  });
  const project = dataArr[0]?.fields;
  // Use the router, throw up a 404 if we can't find any data
  const router = useRouter();
  if (!router.isFallback && !project) {
    return <ErrorPage statusCode={404} />
  }
  ReactGA.initialize('UA-109026249-1');
  ReactGA.pageview(`Project Page: ${project.title}`);
  return (
    <Layout className="Project" preview={false}>
      <AnimationContainer />
      <article className="Container Project mt5">
        <h2 className="body-header Project__title">{project.title}</h2>
        <section className="Project__description mt3">
          {documentToReactComponents(project.description)}
        </section>
        {(project.gallery && project.gallery.length) && (
          <ul className="Project__image-list flex flex-column items-center mt5 mt6-lg">
            {project.gallery.map((item, index) => {
              const randomWalk = walkArr[(index + 3) % 8];
              return (
                <li
                  key={index}
                  className={classnames('Project__image-wrapper mb5 mb6-lg', {
                    'Project__image-wrapper--left-far': randomWalk === -2,
                    'Project__image-wrapper--left': randomWalk === -1,
                    'Project__image-wrapper--right': randomWalk === 1,
                    'Project__image-wrapper--right-far': randomWalk === 2
                  })}
                >
                  <div className="wrap">
                    <img
                      className="Project__image pa2"
                      src={`${item.fields.file.url}?w=1440&fm=jpg&fl=progressive&q=70`}
                      alt={item.fields.title}
                    />
                  </div>
                  {item.fields.description && (
                    <div
                      className={classnames('Project__image-description pa3', {
                        'Project__image-description--wide': item.fields.description.split(' ').length > 60
                      })}
                    >
                      <p>{item.fields.description}</p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </article>
    </Layout>
  )
}

export async function getStaticProps(context) {
  const params = context.params;
  const projects = await getProjects(false);
  return {
    props: {
      slug: params,
      projects: projects
    }
  }
}

export async function getStaticPaths() {
  const projects = await getProjects(false);
  return {
    paths: projects?.map(item => `/projects/${item.fields.slug}`) ?? [],
    fallback: false
  }
}
