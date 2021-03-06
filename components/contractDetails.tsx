// import router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  errorStyles,
  fileUploadStyle,
  formAddNewJoiner,
  successStyle,
} from './elements';

type Errors = { message: string }[];

interface ChildProps {
  apiResponse: boolean;
  newJoinerUserId: number;
  cloudKey: string;
  uploadPreset: string;
  setAddNewJoiner: React.Dispatch<React.SetStateAction<boolean>>;
  setApiResponse: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddContractDetails({
  newJoinerUserId,
  apiResponse,
  cloudKey,
  uploadPreset,
  setAddNewJoiner,
  setApiResponse,
}: ChildProps) {
  const [startingDate, setStartingDate] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [salary, setSalary] = useState<number>();
  const [isDisabled, setIsDisabled] = useState(true);
  const [errors, setErrors] = useState<Errors>();
  const [uploadContract, setUploadContract] = useState('');

  useEffect(() => {
    if (newJoinerUserId) {
      setIsDisabled(false);
    }
  }, [newJoinerUserId]);

  // send contract to cloud
  const uploadContractToCloud = async (event: any) => {
    const formData = new FormData();
    formData.append('file', event[0]);
    formData.append('upload_preset', uploadPreset);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudKey}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const formDataResponse = await cloudinaryResponse.json();

    if ('error' in formDataResponse) {
      console.log('failed to upload to cloud');
    }

    setUploadContract(formDataResponse.url);
  };

  return (
    <>
      <div css={errorStyles}>{errors && <p>{errors}</p>}</div>

      <form
        css={formAddNewJoiner}
        onSubmit={async (event) => {
          event.preventDefault();

          // send forminput to api
          const addContractResponse = await fetch(
            `/api/contract/${newJoinerUserId}}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: newJoinerUserId,
                startingDate: startingDate,
                jobTitle: jobTitle,
                salary: salary,
                benefits: uploadContract,
              }),
            },
          );

          // check response from api for errors
          const addContractResponseBody = await addContractResponse.json();
          if ('errors' in addContractResponseBody) {
            setErrors(addContractResponseBody.errors);
            return;
          }
          setErrors([]);

          if (addContractResponseBody) {
            setApiResponse(true);
            setStartingDate('');
            setJobTitle('');
            setSalary(0);
            setUploadContract('');
            setApiResponse(true);
          }
          console.log('AddContractResponseBody:', addContractResponseBody);
        }}
      >
        <section>
          <article>
            <h2>Add Offer Details</h2>
            {!apiResponse ? (
              <ul>
                <div>
                  {' '}
                  <li>
                    <label htmlFor="startingDate">Start Date</label>
                  </li>
                  <li>
                    {' '}
                    <input
                      type="Date"
                      id="startingDate"
                      name="startingDate"
                      disabled={isDisabled}
                      value={startingDate}
                      onChange={(event) =>
                        setStartingDate(event.currentTarget.value)
                      }
                    />{' '}
                  </li>
                </div>
                <div>
                  <li>
                    {' '}
                    <label htmlFor="jobTitle">Job Title</label>
                  </li>
                  <li>
                    <input
                      id="jotTitle"
                      name="jobTitle"
                      disabled={isDisabled}
                      value={jobTitle}
                      onChange={(event) =>
                        setJobTitle(event.currentTarget.value)
                      }
                    />
                  </li>
                </div>
                <div>
                  {' '}
                  <li>
                    <label htmlFor="salary">Annual Salary</label>
                  </li>
                  <li>
                    <input
                      type="number"
                      id="salary"
                      name="salary"
                      disabled={isDisabled}
                      value={salary}
                      onChange={(event) =>
                        setSalary(Number(event.currentTarget.value))
                      }
                    />
                  </li>
                </div>
                <div>
                  <li>
                    {' '}
                    <label htmlFor="uploadImage">Contract</label>
                  </li>
                  <li>
                    {' '}
                    <input
                      css={fileUploadStyle}
                      id="uploadImage"
                      name="uploadImage"
                      type="file"
                      onChange={(event) => {
                        uploadContractToCloud(event.target.files).catch(
                          () => {},
                        );
                      }}
                    />
                  </li>
                </div>

                <div>
                  <button>Save Offer Details</button>
                </div>
              </ul>
            ) : (
              (setAddNewJoiner(true),
              (
                <div css={successStyle}>
                  <p>Offer details succesfully added!</p>
                </div>
              ))
            )}
          </article>
        </section>
      </form>
    </>
  );
}
