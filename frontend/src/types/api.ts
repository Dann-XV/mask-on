export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  /** The backend's JWT lasts an hour; 401/403 both mean "log in again". */
  get isAuthFailure() {
    return this.status === 401 || this.status === 403;
  }
}

export interface RegisterResponse {
  username: string;
  message: string;
}

export interface LoginResponse {
  username: string;
  token: string;
  message: string;
}

/** Shape of `contacts` populated with usernames by GET /users/me/contacts. */
export interface Contact {
  _id: string;
  username: string;
}
