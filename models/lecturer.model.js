import mongoose from "mongoose";

const Schema = mongoose.Schema;

const lecturerSchema = new Schema(
    {
        lecturerName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        staffID: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

// FOR LOGGING IN A LECTURER
lecturerSchema.statics.login = async function (email, staffID, password) {
    const lecturer = await this.findOne({ email });
    if (lecturer) {
        console.log("login statics: ", lecturer);
        const password_match = await lecturer.password === password;
        const staffID_match = await lecturer.staffID === staffID;
        if (password_match) {
            if (staffID_match) {
                return lecturer;
            } else {
                throw Error("Incorrect Staff ID");
            }
        } else {
            throw Error("Incorrect Password");
        }
    }
    throw Error("Incorrect Email");
}

const Lecturer = mongoose.model('Lecturer', lecturerSchema);
export { Lecturer };