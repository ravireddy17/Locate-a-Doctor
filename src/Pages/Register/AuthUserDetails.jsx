function AuthUserDetails(values) {
    const error = {};
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const password_pattern =/^[a-zA-Z0-9!@#$%^&*()_+}{":;?/>.<,|\\~`\-=[\]\\';,/]{8,}$/;
    const phonePattern = /^[0-9]{10}$/;
    const username_pattern = /^[a-zA-Z0-9]{3,}$/;

    if (!values.Email) {
        error.Email = "Email should not be empty";
    } else if (!email_pattern.test(values.Email)) {
        error.Email = "Invalid email format";
    }
    if (!values.Phone) {
        error.Phone = "Phone should not be empty";
    }
    else if (!phonePattern.test(values.Phone)) {
        error.Phone = "Phone number must be 10 digits";
    }

    if (!values.Password) {
        error.Password = "Password should not be empty";
    } else if (!password_pattern.test(values.Password)) {
        error.Password = "Password must be at least 8 characters long";
    }

    if (!values.ConfirmPassword) {
        error.ConfirmPassword = "Confirm Password should not be empty";
    } else if (String(values.ConfirmPassword) !== String(values.Password)) {
        error.ConfirmPassword = "Confirm Password didn't match";
    }

    if (!values.UserName) {
        error.UserName = "UserName should not be empty";
    } else if (!username_pattern.test(values.UserName)) {
        error.UserName = "Username must be at least 3 characters long and can only contain alphanumeric characters";
    }

    if (!values.FullName) {
        error.FullName = "FullName should not be empty";
    }

    return error;
}

export default AuthUserDetails;