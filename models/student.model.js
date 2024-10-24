import mongoose from "mongoose";

const Schema = mongoose.Schema;

const studentSchema = new Schema(
    {
        studentName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        regNo: {
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

// FOR LOGGING IN A STUDENT
studentSchema.statics.login = async function (email, regNo, password) {
    const student = await this.findOne({ email });
    if (student) {
        console.log("login statics: ", student);
        const password_match = await student.password === password;
        const regNo_match = await student.regNo === regNo;
        if (password_match) {
            if (regNo_match) {
                return student;
            } else {
                throw Error("Incorrect Reg No");
            }
        } else {
            throw Error("Incorrect Password");
        }
    }
    throw Error("Incorrect Email");
}

const Student = mongoose.model('Student', studentSchema);
export { Student };