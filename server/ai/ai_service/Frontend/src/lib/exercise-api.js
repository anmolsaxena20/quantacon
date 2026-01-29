const BASE_URL = "https://exercises-api.cyclic.app/exercises";
const IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/images/";


let exerciseListPromise = null;

export const fetchExerciseLibrary = async () => {
    if (exerciseListPromise) {
        return exerciseListPromise;
    }

    exerciseListPromise = fetch(BASE_URL)
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch exercise database");
            return res.json();
        })
        .catch(err => {
            console.error(err);
            return [];
        });

    return exerciseListPromise;
};

const NAME_MAPPING = {
    "Push-ups": "Pushups",
    "Wide Push-ups": "Pushups", 
    "Diamond Push-ups": "Pushups", 
    "Incline Push-ups": "Incline Push-Up",
    "Decline Push-ups": "Decline Push-Up",
    "Dumbbell Press": "Arnold Dumbbell Press", 
    "Pull-ups": "Pullups",
    "Dumbbell Rows": "Bent Over Two-Dumbbell Row",
    "Lateral Raises": "Dumbbell Lying Rear Lateral Raise", 
    "Shoulder Taps": "Pushups", 
    "Dumbbell Curls": "One Arm Dumbbell Preacher Curl", 
    "Hammer Curls": "Hammer Curls",
    "Tricep Dips": "Bench Dips",
    "Tricep Extensions": "Dumbbell One-Arm Triceps Extension",
    "Kickbacks": "Tricep Dumbbell Kickback",
    "Squats": "Bodyweight Squat",
    "Jump Squats": "Bodyweight Squat", 
    "Lunges": "Dumbbell Lunges",
    "Calf Raises": "Standing Calf Raises", 
    "Plank": "Plank",
    "Crunches": "Crunches",
    "Russian Twists": "Cable Russian Twists", 
    "Bicycle Crunches": "Crunches", 
    "Leg Raises": "Front Leg Raises"
};

export const getExerciseVisuals = async (queryName) => {
    return [];
};

const normalize = (str) => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
};
