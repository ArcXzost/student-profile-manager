import React from 'react'
import Rightbar from '../ui/dashboard/rightbar/rightbar.jsx'
import Chart from '../ui/dashboard/chart/chart.jsx'
import Card from '../ui/dashboard/card/card.jsx'
import Actions from '../ui/dashboard/actions/actions.jsx'
import styles from '../ui/dashboard/dashboard.module.css'
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonChalkboard, faUserGraduate, faBook } from "@fortawesome/free-solid-svg-icons";

const data = [
  {
    id: 1,
    title: 'Students',
    value: 1500,
    details: 'A new batch to be added soon..',
    icon: <FontAwesomeIcon icon={faUserGraduate} className="fas fa-user-graduate" style={{position: "absolute", top: "9.7vw" ,left: "29vw", color: "grey" }} />
  },
  {
    id: 2,
    title: 'Faculty',
    value: 70,
    details: 'Highest Rank: 66 (NIRF 2020)',
    icon: <FontAwesomeIcon icon={faPersonChalkboard} className="fas fa-person-chalkboard" style={{position: "absolute", top: "9.7vw" ,left: "48.5vw", color: "grey" }} />
  },
  {
    id: 3,
    title: 'Courses',
    value: 100,
    details: 'CSE and ECE as core branches..',
    icon: <FontAwesomeIcon icon={faBook} className="fas fa-book" style={{position: "absolute", top: "9.7vw" ,left: "69vw", color: "grey" }} />
  },
]

const dashboard = () => {
  return (
    <>
      {(
      <div className={styles.wrapper} >
        <div className={styles.main}>
          <div className={styles.cards}>

            <Card
              id={1}
              title={data[0].title}
              value={data[0].value}
              details={data[0].details}
              icon={data[0].icon}
              item="+"
            />
            <Card
              id={2}
              title={data[1].title}
              value={data[1].value}
              details={data[1].details}
              icon={data[1].icon}
              item="+"
            />
            <Card
              id={3}
              title={data[2].title}
              value={data[2].value}
              details={data[2].details}
              icon={data[2].icon}
              item="+"
            />
          </div>
          <Actions />
          <Chart />
        </div>
        <div className={styles.side}>
          <Rightbar />
        </div>
      </div>)
}
    </>
  )
}

export default dashboard
