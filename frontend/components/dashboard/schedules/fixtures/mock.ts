import type {
  ScheduleOut,
  ScheduleListOut,
  ScheduleTaskOut,
} from "~components/dashboard/schedules/types/schedule"

export const MOCK_SCHEDULES: ScheduleOut[] = [
  {
    id: 1,
    user_id: 1,
    name: "Work",
    days_of_week: [0, 1, 2, 3, 4],
    start_time: "09:00",
    end_time: "17:00",
  },
  {
    id: 2,
    user_id: 1,
    name: "Gym",
    days_of_week: [2, 4],
    start_time: "07:00",
    end_time: "08:00",
  },
  {
    id: 3,
    user_id: 1,
    name: "Deep work",
    days_of_week: [4],
    start_time: "14:00",
    end_time: "16:00",
  },
  {
    id: 4,
    user_id: 1,
    name: "Morning routine",
    days_of_week: [0, 1, 2, 3, 4],
    start_time: "06:00",
    end_time: "08:00",
  },
  {
    id: 5,
    user_id: 1,
    name: "Meetings",
    days_of_week: [1],
    start_time: "10:00",
    end_time: "12:00",
  },
  {
    id: 6,
    user_id: 1,
    name: "Lunch break",
    days_of_week: [1],
    start_time: "12:00",
    end_time: "13:00",
  },
  {
    id: 7,
    user_id: 1,
    name: "Focus block",
    days_of_week: [2],
    start_time: "09:00",
    end_time: "12:00",
  },
  {
    id: 8,
    user_id: 1,
    name: "Reading",
    days_of_week: [3],
    start_time: "20:00",
    end_time: "21:00",
  },
  {
    id: 9,
    user_id: 1,
    name: "Weekend project",
    days_of_week: [5, 6],
    start_time: "10:00",
    end_time: "14:00",
  },
  {
    id: 10,
    user_id: 1,
    name: "Rest day",
    days_of_week: [6],
    start_time: "08:00",
    end_time: "18:00",
  },
  {
    id: 11,
    user_id: 1,
    name: "Standup",
    days_of_week: [0],
    start_time: "09:00",
    end_time: "09:30",
  },
  {
    id: 12,
    user_id: 1,
    name: "Code review",
    days_of_week: [2],
    start_time: "15:00",
    end_time: "16:00",
  },
  {
    id: 13,
    user_id: 1,
    name: "Planning",
    days_of_week: [4],
    start_time: "09:00",
    end_time: "10:00",
  },
  {
    id: 14,
    user_id: 1,
    name: "Learning",
    days_of_week: [5],
    start_time: "15:00",
    end_time: "17:00",
  },
  {
    id: 15,
    user_id: 1,
    name: "Admin",
    days_of_week: [0],
    start_time: "17:00",
    end_time: "18:00",
  },
]

const fakeTasksForSchedule = (scheduleId: number): ScheduleTaskOut[] => {
  const bySchedule: Record<number, ScheduleTaskOut[]> = {
    1: [
      { id: 101, title: "Check emails" },
      { id: 102, title: "Team standup" },
      { id: 103, title: "Ship feature" },
    ],
    2: [
      { id: 201, title: "Warm up" },
      { id: 202, title: "Strength training" },
    ],
    3: [
      { id: 301, title: "Write docs" },
      { id: 302, title: "Code review" },
    ],
  }
  return bySchedule[scheduleId] ?? []
}

export function getMockScheduleDetail(schedule: ScheduleOut): ScheduleListOut {
  return {
    ...schedule,
    tasks: fakeTasksForSchedule(schedule.id),
  }
}