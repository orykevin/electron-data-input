import { useEffect, useState } from 'react'
import { database } from './db'
import Main from './page/main'

function App(): JSX.Element {
  return (
    <div>
      <Main />
      {/* <div>
        <form
          onSubmit={async (e) => {
            e.preventDefault()

            const formData = new FormData(e.target as HTMLFormElement)
            const title = formData.get('title') as string
            if (title) {
              await database.insert(posts).values({
                id: Math.floor(Math.random() * 1000),
                title
              })

              // refetch
              const result = await database.query.posts.findMany()
              setPosts(result)
            }
          }}
        >
          <input name="title" type="text" placeholder="title" />
          <Button className="text-lg">add 1</Button>
        </form>
      </div>
      {postList.map((post) => {
        return <div key={post.id}>{post.title} list</div>
      })} */}
    </div>
  )
}

export default App
