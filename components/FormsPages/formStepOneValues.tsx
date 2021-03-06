import { Fragment, useState } from 'react';
import { User } from '../../util/database';
import {
  errorStyles,
  flexStyle,
  formStyle,
  hideForm,
  showForm,
} from '../elements';

type Errors = { message: string }[];

interface ChildProps {
  formStep: number | undefined;
  setFormStep: React.Dispatch<React.SetStateAction<number | undefined>>;
  user: User;
}

export default function FormStepOneValues({
  formStep,
  setFormStep,
  user,
}: ChildProps) {
  // const requieredTrue = false;
  const [errorsApi, setErrorsApi] = useState<Errors>([]);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [socialSecNumber, setSocialSecNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  if (formStep !== 0) {
    return <>Test</>;
  }

  return (
    <>
      <h1> Step {formStep + 1} of 4</h1>
      <div css={errorStyles}>
        {errorsApi.map((error) => {
          return <div key={`error-${error.message}`}>{error.message}</div>;
        })}
      </div>
      <form
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        css={[formStyle, formStep === 0 ? showForm : hideForm]}
        onSubmit={async (event) => {
          event.preventDefault();

          // send form input to api
          const formInputResponse = await fetch('/api/formStepOneValues', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dateOfBirth: dateOfBirth,
              socialSecNumber: parseInt(socialSecNumber),
              nationality: nationality,
              email: email,
              phone: phone,
              userId: user.id,
              formStep: formStep,
            }),
          });

          // check response from api for errors
          const formInputResponseBody = await formInputResponse.json();
          if ('errors' in formInputResponseBody) {
            setErrorsApi(formInputResponseBody.errors);
            return;
          }
          setErrorsApi([]);

          // response from api okay ==> update formstep variable
          const nextFormStep = formStep + 1;
          setFormStep(nextFormStep);
        }}
      >
        <section>
          <p>
            <label htmlFor="email">
              <span>E-mail: </span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              placeholder="janedoe@test.com"
              onChange={(event) => setEmail(event.currentTarget.value)}
            />
          </p>
          <div css={flexStyle}>
            <p>
              <label htmlFor="dateOfBirth">
                <span>Date Of Birth: </span>
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.currentTarget.value)}
              />
            </p>
            <p>
              <label htmlFor="socialSecNumber">
                <span>Social Security Number: </span>
              </label>
              <input
                type="tel"
                id="socialSecNumber"
                name="socialSecNumber"
                placeholder="XXXX DDMMYY"
                // maxLength={15}
                value={socialSecNumber}
                onChange={(event) =>
                  setSocialSecNumber(event.currentTarget.value)
                }
              />
            </p>
          </div>

          <div css={flexStyle}>
            <p>
              <label htmlFor="nationality">
                <span>Nationality: </span>
              </label>
              <input
                id="nationality"
                name="nationality"
                value={nationality}
                placeholder="Country"
                onChange={(event) => setNationality(event.currentTarget.value)}
              />
            </p>
            <p>
              <label htmlFor="phone">
                <span>Phone: </span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                min={0}
                value={phone}
                placeholder="0043 660 000 00 00"
                onChange={(event) => setPhone(event.currentTarget.value)}
              />
            </p>
          </div>
        </section>
        <button>Step 2 </button>
      </form>
    </>
  );
}
