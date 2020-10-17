/**
 * 2. 다음과 같이 유저, 포스트, 댓글 3개의 테이블이 있습니다.
 *
 * # users #
 *   id: integer, PK,
 *   name: varchar,
 *
 * # posts #
 *   id: integer, PK,
 *   user_id: integer, FK:users.id,
 *   title: varchar,
 *   body: text,
 *   created_at: timestamp,
 *
 * # comments #
 *   id: integer, PK,
 *   user_id: integer, FK:users.id,
 *   post_id: integer, FK:posts.id,
 *   body: text,
 *   created_at: timestamp,
 *
 * 유저_1(id:1)이 작성한 포스트_1(id:1)에
 * 유저_2(id:2)가 댓글_1(id:1)을 작성했을 경우,
 * 유저_1(id:1)에게 해당 이벤트에 대하여,
 *
 * ${posts.title} 포스팅에 ${users.name} 님이 댓글을 작성하였습니다.
 * ${comments.body 내용 중 일부...}
 * ${작성시각}
 * ${읽음처리결과}
 *
 * 위와 같은 내용으로 알림 서비스를 구현하고자 합니다.
 * (유저_1 이 서비스에 접속시, 헤더 부분에 읽지 않은 알림 개수를 표현하고, 이를 클릭했을 경우 위와 같은 알림 리스트가 보임)
 *
 * 이를 구현하기 위한 알림에 대한 테이블 notices 스키마를 작성해주세요. (지원자께서 편한 방식으로 작성하시면 됩니다.)
 *
 * # notices # JOIN을 많이 사용하여도 문제가 없는 경우
 *    id: integer, PK,
 *    user_id: integer, FK:users.id,
 *    post_id: integer, FK:posts.id,
 *    comment_id : integer, FK:comments
 *    read_flag   : boolean(mysql: TINYINT)
 * 
 *    id: integer, PK,
 *    comment_id : integer, FK:comments
 *    read_flag   : boolean(mysql: TINYINT)
 * 
 * QUERY문
 * 1. 덧글 작성 후 알림 추가
 * INSERT INTO 'notices' ('user_id', 'comment_id', 'read_flag') VALUES ('${댓글이 달린 게시글 작성자 users.id}',${댓글이 달린 게시글 post_id}, 0); 
 * INSERT INTO 'notices' ('comment_id', 'read_flag') VALUES ('${댓글이 달린 게시글 작성자 users.id}', 0); 
 * 2. 알림을 보여줄때
    SELECT posts.title AS title, users.name AS name, LEFT(comments.body, 5) AS body, comments.created_at AS time, notices.read_flag AS read_flag
      FROM (SELECT * FROM my_test.notices WHERE user_id = ${알림을 보여줄 사용자 users.id} AND read_flag = false) AS notices, count(notices.id) AS 'count'
      JOIN posts ON notices.post_id = posts.id
        JOIN comments ON notices.comment_id = comments.id
        JOIN users ON comments.user_id = users.id
        ORDER BY comments.created_at DESC
        LIMIT 30;
    SELECT posts.title AS title, users.name AS name, LEFT(comments.body, 5) AS body, comments.created_at AS time, notices.read_flag AS 'read_flag', count(notices.id) AS 'count'
      FROM (SELECT * FROM my_test.notices WHERE user_id = 1 AND read_flag = false) AS notices
        JOIN comments ON notices.comment_id = comments.id
        JOIN posts ON comments.post_id = posts.id
        JOIN users ON comments.user_id = users.id
        ORDER BY comments.created_at ASC
        LIMIT 30;
   3. 확인 후 수정
   UPDATE (SELECT * FROM comments WHERE post_id=${현재 확인중인 게시글 posts.id}) AS comments 
      JOIN notices ON notices.read_flag = false AND notices.comment_id = comments.id
      SET notices.read_flag = '1' 
      WHERE notices.user_id = ${현재 댓글을 확인하는 사용자 users.id};
  UPDATE (
    SELECT * FROM comments WHERE post_id=1) AS comments 
    JOIN notices ON notices.read_flag = false AND notices.comment_id = comments.id
    JOIN posts ON comments.post_id = posts.id
    SET notices.read_flag = '1' WHERE posts.user_id = 1;
 */