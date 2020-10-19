# question-1

## [question-1_done_vanila.js](https://github.com/GomJY/interview_inflean/blob/master/question-1_done_vanila.js)
 - 바닐라로만 구현한 프로젝트 입니다.
 - module을 사용하지 않고, question1 문제를 풀었습니다.   

## [question-1_done_fx.js](https://github.com/GomJY/interview_inflean/blob/master/question-1_done_fx.js)
 - fx_module을 사용하여 구현한 프로젝트 입니다.
 - [함수형 프로그래밍과 JavaScript ES6+](https://www.inflearn.com/course/functional-es6) 강의를 보고 만든 module을 사용하여 question1 문제를 풀었습니다. 


# question-2
![Untitled](https://github.com/GomJY/interview_inflean/blob/master/question-2_done-diagram.png)

 # notices 
  ## 스키마
    - id: integer, PK
    - user_id: integer, FK:users.id,
    - post_id: integer, FK:posts.id,
    - comment_id : integer, FK:comments
    - read_flag   : boolean(mysql: TINYINT)
  ## 다이어그램 링크
  https://drawsql.app/ju-1/diagrams/inflean-question2
  
  ## QUERY문
  ### 1. 덧글 작성 후 알림 추가
  ```sql
  INSERT INTO 'notices' ('user_id', 'post_id', 'comment_id', 'read_flag') VALUES ('${게시글 작성자 users.id}',${댓글이 달린 게시글 post_id}, ${덧글 comments.id} 0);
  ```
  ### 2-1. 읽지 않은 알림 갯수
   ```sql
   SELECT count() FROM notices WHERE user_id = ${유저1_user.id} AND read_flag = false;
   ```
  ### 2-2.  알림을 보여줄때
  ```sql
    SELECT posts.title AS title, users.name AS name, LEFT(comments.body, 5) AS body, comments.created_at AS time, notices.read_flag AS read_flag
      FROM (SELECT  FROM my_test.notices WHERE user_id = ${알림을 보여줄 사용자 users.id}) AS notices
      JOIN posts ON notices.post_id = posts.id
        JOIN comments ON notices.comment_id = comments.id
        JOIN users ON comments.user_id = users.id
        ORDER BY comments.created_at DESC
        LIMIT ${알림 최대로 보여줄 갯수};
  ```
   ### 3. 확인 후 수정
   ```sql
   UPDATE (SELECT  FROM comments WHERE post_id=${현재 확인중인 게시글 posts.id}) AS comments 
      JOIN notices ON notices.read_flag = false AND notices.comment_id = comments.id
      SET notices.read_flag = '1' 
      WHERE notices.user_id = ${현재 댓글을 확인하는 사용자 users.id};
   ```