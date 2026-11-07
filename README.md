# TalentHub — Campus Placement Management

A responsive campus placement portal built with **Node.js + Express**. TalentHub brings the placement journey into one workspace: students discover eligible roles and apply, companies/placement teams review the pipeline, interviews are scheduled, offers are issued, and coordinators can review placement data.

## Scenario coverage

The implementation follows the supplied TalentHub scenario:
1. Student profiles hold branch, CGPA and active backlog information.
2. Eligibility checks compare a student's branch, CGPA and backlogs with a job's criteria.
3. Eligible students can apply; duplicate applications are prevented.
4. Applications can move through Applied, Shortlisted, Interview Scheduled, Rejected and Offer Issued.
5. Interviews can be scheduled and offers can be accepted or declined.
6. The overview presents student, job, application and accepted-offer counts.

**Roles represented in the scenario:** Student, Company and Placement Coordinator. This starter demonstrates their core workflow in one shared demo workspace. It does not implement production authentication or role-based access control.

## Tech stack
- Node.js and Express
- HTML5, CSS3 and vanilla JavaScript
- JSON file persistence (`data/store.json`) for an easy local demo
- REST API endpoints under `/api`

## Run locally
1. Install Node.js 18 or later.
2. Extract this ZIP and open the `TalentHub` folder in VS Code / IntelliJ.
3. Open a terminal in that folder.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the server:
   ```bash
   npm start
   ```
6. Open **http://localhost:3000**.

The app uses sample records on first run. Changes are saved to `data/store.json`. To reset the demo, restore the original `store.json` from the ZIP.

## API quick reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/data` | Read all demo data |
| GET | `/api/overview` | Dashboard metrics |
| GET | `/api/jobs` | List jobs |
| GET | `/api/jobs/:id/eligibility/:studentId` | Check eligibility |
| POST | `/api/applications` | Submit an eligible application |
| PATCH | `/api/applications/:id/status` | Update application status |
| POST | `/api/interviews` | Schedule an interview |
| POST | `/api/offers` | Issue an offer |
| PATCH | `/api/offers/:id` | Record offer decision |
| POST | `/api/jobs` | Create a job listing |

### Example: apply to a job
```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d "{\"studentId\":1,\"jobId\":1}"
```

## Project structure
```text
TalentHub/
├── data/
│   └── store.json
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── package.json
├── server.js
└── README.md
```

## Important notes before production
- JSON storage is intended for a classroom prototype. Replace it with MySQL/PostgreSQL and add migrations for real deployment.
- Add authentication, password hashing, session/token handling and server-side role authorization before exposing the system.
- Validate all input, add audit logs, pagination, rate limiting, secure headers and automated tests.
- Eligibility rules shown here use the scenario's example fields. The approved institutional placement policy must define the final rules.
- Demo profiles and company records are fictional sample data.

## Useful demo path
1. Open **Explore jobs** and choose a student from the selector.
2. Compare eligibility labels across job cards.
3. Apply as Rahul Sharma to ABC Technologies' Graduate Software Engineer role (sample criteria: CGPA 7.0+, no more than two active backlogs; branch must also match).
4. Open **Applications** to see the new record.
5. Use the API to shortlist or schedule an interview.
6. Open **Offers** to accept or decline an issued offer.
7. Return to **Overview** to see the updated placement metrics.
