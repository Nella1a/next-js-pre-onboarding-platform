import { css } from '@emotion/react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import AddNewJoiner from '../components/AddNewJoiner';
import { sectionOneLayout } from '../components/elements';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import {
  getAllNewJoiners,
  getUserByValidSessionToken,
  NewJoiners,
  User,
} from '../util/database';

const styleNewHire = css`
  display: flex;
  gap: 0.5rem;
  margin: 1rem 1rem;
`;

type Props = {
  userObject: User;
  userFirstName: string;
  headerImage: string;
  user: User;
  newJoiners: User[];
};

export default function Dashboard(props: Props) {
  const [addNewJoiner, setAddNewJoiner] = useState<User>();
  // const [required, setRequired] = useState(true);
  console.log('NewJoiner:', addNewJoiner);

  console.log('props.newJoiner:', props.newJoiners);
  if (!props.user) {
    return (
      <Layout
        userObject={props.userObject}
        userFirstName={props.userFirstName}
        headerImage={props.headerImage}
      >
        <Head>
          <title>User not found</title>
          <meta name="description" content="User not found" />
        </Head>
        <h1>You are not allowed to see this site</h1>
      </Layout>
    );
  }
  return (
    <Layout
      userObject={props.userObject}
      userFirstName={props.userFirstName}
      headerImage={props.headerImage}
    >
      <Head>
        <title>Welcome</title>
        <meta name="description" content="Landing page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* <h1>Welcome X</h1>
      <p>It's great to have you with us.</p> */}
      <section css={sectionOneLayout}>
        <Navigation userId={props.user.id} userRole={props.user.roleId} />
      </section>

      <section>
        <h1>
          {' '}
          Personal Details: Hello {props.user.username} User_id: {props.user.id}
          User_role: {props.user.roleId}{' '}
        </h1>

        <h2>List of all new hires</h2>

        {props.newJoiners.map((joiner) => {
          return (
            <div key={`overview-${joiner.id}`} css={styleNewHire}>
              <p> Id: {joiner.id} </p>
              <p> First Name: {joiner.firstName} </p>
              <p> Last Name: {joiner.lastName} </p>
              <p> roleId:{joiner.roleId}</p>{' '}
            </div>
          );
        })}
        {addNewJoiner && (
          <div>
            New:
            <p> Id: {addNewJoiner.id} </p>
            <p> First Name: {addNewJoiner.firstName} </p>
            <p> Last Name: {addNewJoiner.lastName} </p>
            <p> roleId:{addNewJoiner.roleId}</p>{' '}
          </div>
        )}
      </section>
    </Layout>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<
  GetServerSidePropsResult<{
    user?: User;
    newJoiners: User;
  }>
> {
  // 1. Get current user from the cookie sessionToken
  const token = context.req.cookies.sessionToken;

  // 2. Retrieve user by valid sessionToken
  const user = await getUserByValidSessionToken(token);
  // TO DO CHECK ROLE Of USER

  // Error Handling: if user exists but does not have the right role redirect to home
  if (user && user.roleId !== 1) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Error Handling: if user does not exist (= no token) redirect to login
  if (!user) {
    return {
      redirect: {
        destination: '/employer/login',
        permanent: false,
      },
    };
  }

  // success: if user exists and has the right role return user and render page
  if (user && user.roleId === 1) {
    const userRoleId = 2;
    // get all new joiners
    const newJoiners = await getAllNewJoiners(userRoleId);

    console.log('newJoiners', newJoiners);

    return {
      props: {
        user: user,
        newJoiners: JSON.parse(JSON.stringify(newJoiners)),

        //  Fix the error using JSON.parse() and JSON.stringify()
      },
    };
  }

  return {
    props: {
      user: user,
    },
  };
}
