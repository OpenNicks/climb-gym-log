from sqlmodel import Session, select
from app.db import engine
from app.models.core import Gym, Climb, User
from datetime import datetime
from app.auth import get_password_hash

# Seed demo data only if not present
def seed_demo():
    with Session(engine) as session:
        # Seed gyms
        if not session.exec(select(Gym)).first():
            gym1 = Gym(name="Summit Central", location="Seattle, WA")
            gym2 = Gym(name="Vertical World", location="Redmond, WA")
            session.add(gym1)
            session.add(gym2)
            session.commit()
            session.refresh(gym1)
            session.refresh(gym2)
        else:
            gym1 = session.exec(select(Gym)).first()
            gym2 = session.exec(select(Gym)).offset(1).first()

        # Seed user
        if not session.exec(select(User)).first():
            user = User(username="demo", email="demo@example.com", hashed_password=get_password_hash("password"), is_public=True)
            session.add(user)
            session.commit()
            session.refresh(user)
        else:
            user = session.exec(select(User)).first()

        # Seed climbs
        if not session.exec(select(Climb)).first():
            climb1 = Climb(
                gym_id=gym1.id,
                color="Blue",
                setter="Sam",
                section="Boulder Cave",
                setter_grade="V3",
                date_added=datetime.now(),
                rating=4
            )
            climb2 = Climb(
                gym_id=gym2.id,
                color="Red",
                setter="Alex",
                section="Lead Wall",
                setter_grade="5.11a",
                date_added=datetime.now(),
                rating=5
            )
            session.add(climb1)
            session.add(climb2)
            session.commit()


if __name__ == "__main__":
    seed_demo()
