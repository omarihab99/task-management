## DB Data Shape
#### user
```sql
id: uuid primary key
email: string unique not null
password: string not null
role: string not null default 'trainee'
name: string unique not null
token: string
verificationCode: string
expirationCode: timestamp
createdAt: timestamp default NOW()
updatedAt: timestamp default NOW()
team: Team on delete set null
assignments: Assignment[]
reviews: Review[]
feedbacks: Feedback[];
```

#### team
```sql
id: uuid primary key
name: string not null
cordinator: User on delete set null
users: User[];
```

#### task
```sql
id: uuid primary key
title: string unique
topic: string not null
sprint: number not null
deadlineAt: timestamp not null
createdAt: timestamp default NOW()
updatedAt: timestamp default NOW()
assignments: Assignment[]
```

#### assignment
```sql
id: uuid primary key
source: string not null
status: string default 'under review' not null
comment: string
createdAt: timestamp default NOW()
updatedAt: timestamp default NOW()
task: Task on delete cascade not null
user: User on delete cascade not null
reviews: Review[];
feedbacks: Feedback[] on delete set null;

user_task_index: index [task,user] unique
```

#### review
```sql
id: uuid primary key
DS: number not null
QDS: number not null
comment: string
createdAt: timestamp default NOW()
updatedAt: timestamp default NOW()
user: User on delete cascade not null
assignment: Assignment on delete cascade not null

user_assignment_index: index [assignment,user] unique
```

#### feedback
```sql
id: uuid primary key
DS: number not null
QDS: number not null
budget: number not null
satisfaction: number not null
comment: string not null
createdAt: timestamp default NOW()
updatedAt: timestamp default NOW()
user: User on delete cascade not null
assignment: Assignment on delete cascade not null

user_assignment_feedback_index: index [assignment,user] unique
```