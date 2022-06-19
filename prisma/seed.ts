import type { Event } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const mockEvents: Omit<
  Event,
  'id' | 'updatedAt' | 'createdAt' | 'createdById' | 'timelineId' | 'locationId'
>[] = [
  {
    title: 'My first event',
    content: 'The biggest event ever',
    startDate: new Date('2020-01-05')
  },
  {
    title: 'The journey begins',
    content: 'I am so excited',
    startDate: new Date('2020-01-05')
  },
  {
    title: 'I am on my way',
    content: '',
    startDate: new Date('2020-01-08')
  }
]

const userData = [
  {
    email: 'demo@user.com',
    password: 'demouser'
  },
  {
    email: 'noname.olsson@gmail.com',
    password: 'abc123abc123'
  }
]

async function seed() {
  const hashedPassword1 = await bcrypt.hash(userData[0].password, 10)
  const hashedPassword2 = await bcrypt.hash(userData[1].password, 10)

  // cleanup the existing database
  await prisma.user
    .delete({ where: { email: userData[0].email } })
    .catch(() => {
      // no worries if it doesn't exist yet
    })
  await prisma.user
    .delete({ where: { email: userData[1].email } })
    .catch(() => {
      // no worries if it doesn't exist yet
    })

  const user1 = await prisma.user.create({
    data: {
      email: userData[0].email,
      password: {
        create: {
          hash: hashedPassword1
        }
      }
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: userData[1].email,
      password: {
        create: {
          hash: hashedPassword2
        }
      }
    }
  })

  const timeline1 = await prisma.timeline.create({
    data: {
      title: 'My first timeline',
      description: 'The biggest timeline ever',
      createdById: user1.id
    }
  })

  const timeline2 = await prisma.timeline.create({
    data: {
      title: 'Vacation',
      description: 'Follow me when I go on vacation',
      createdById: user2.id
    }
  })

  mockEvents.map(async event => {
    await prisma.event.create({
      data: {
        startDate: event.startDate,
        title: event.title,
        timelineId: timeline1.id
      }
    })
  })

  const location1 = await prisma.location.create({
    data: {
      title: 'Stockholm',
      createdById: user2.id
    }
  })

  const location2 = await prisma.location.create({
    data: {
      title: 'Malmö',
      createdById: user2.id
    }
  })

  console.log(`Database has been seeded. 🌱`)
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
