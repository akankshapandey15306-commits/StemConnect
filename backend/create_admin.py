
from getpass import getpass

from sqlalchemy.exc import IntegrityError

from app.database import SessionLocal
from app.models.admin import Admin
from app.core.security import hash_password


def main():
    email = input("Admin email: ").strip().lower()

    if not email or "@" not in email:
        print("Please enter a valid email.")
        return

    password = getpass("Admin password: ")
    confirm_password = getpass("Confirm password: ")

    if len(password) < 12:
        print("Password must be at least 12 characters.")
        return

    if password != confirm_password:
        print("Passwords do not match.")
        return

    db = SessionLocal()

    try:
        existing_admin = (
            db.query(Admin)
            .filter(Admin.email == email)
            .first()
        )

        if existing_admin:
            print("An admin with this email already exists.")
            return

        admin = Admin(
            email=email,
            hashed_password=hash_password(password),
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print("Admin account created successfully.")

    except IntegrityError:
        db.rollback()
        print("Could not create admin. This email may already exist.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
