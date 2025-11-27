import { formatPace, locationForRun, titleForRun, colorFromType, formatRunTime, Activity, RunIds } from '@/utils/utils';
import styles from './style.module.css';

interface IRunRowProperties {
  elementIndex: number;
  locateActivity: (_runIds: RunIds) => void;
  run: Activity;
  runIndex: number;
  setRunIndex: (_ndex: number) => void;
  isAlternateWeek?: boolean;
}

const RunRow = ({ elementIndex, locateActivity, run, runIndex, setRunIndex, isAlternateWeek }: IRunRowProperties) => {
  const distance = (run.distance / 1000.0).toFixed(2);
  const paceParts = run.average_speed ? formatPace(run.average_speed) : null;
  const heartRate = run.average_heartrate;
  const runTime = formatRunTime(run.moving_time);
  const handleClick = () => {
    if (runIndex === elementIndex) {
      setRunIndex(-1);
      locateActivity([]);
      return
    };
    setRunIndex(elementIndex);
    locateActivity([run.run_id]);
  };

  return (
    <tr
      className={`${styles.runRow} ${runIndex === elementIndex ? styles.selected : ''} ${isAlternateWeek ? styles.altWeek : ''}`}
      key={run.start_date_local}
      onClick={handleClick}
      style={{ color: colorFromType(run.type) }}
    >
      <td>{locationForRun(run).city + titleForRun(run)}</td>
      <td>{distance}</td>
      {paceParts && <td>{paceParts}</td>}
      <td>{heartRate && heartRate.toFixed(0)}</td>
      <td>{runTime}</td>
      <td className={styles.runDate}>{run.start_date_local}</td>
      <td>{run.name}</td>
    </tr>
  );
};

export default RunRow;
