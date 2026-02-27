function UserAuth(values) {
    const errors = {};
    if (values.Username.trim() === '') {
        errors.Username = "Username should not be empty";
    }
    if (values.Password.trim() === '') {
        errors.Password = "Password should not be empty";
    }
  
    return errors;
}
  
export default UserAuth;