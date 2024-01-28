<a onclick="likePost('<%= post._id %>')">
                    <i id="like-icon-<%= post._id %>" class="<%= post.likes.indexOf(user.id) === -1? 'fa-regular fa-heart' : 'fa-solid fa-heart' %>" style="<%= post.likes.indexOf(user.id) === -1 ? 'color: black;' : 'color: #ec0e0e;' %>"></i>
                  </a>

<script>
    // Function to handle the like action
    function likePost(postId) {
      // Make a PUT request to the server using Axios
      axios.get(`/like/${postId}`, {}, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("jwt")
        }
      })
        .then(response => {
          if (response.data.success) {
            // Update the like button color based on the response
            const likeIcon = document.getElementById(`like-icon-${postId}`);
            const likeCount = document.getElementById(`like-count-${postId}`);
            if (likeIcon.classList.contains('fa-regular')) {
              likeIcon.classList.remove('fa-regular');
              likeIcon.classList.add('fa-solid');
              likeIcon.style.color = '#ec0e0e';
              likeCount.textContent = parseInt(likeCount.textContent) + 1 ;
            } else {
              likeIcon.classList.remove('fa-solid');
              likeIcon.classList.add('fa-regular');
              likeIcon.style.color = 'black';
              likeCount.textContent = parseInt(likeCount.textContent) - 1;
            }
          } else {
            console.log('Error: ' + response.data.message);
          }
        })
        .catch(error => {
          console.log('Error: ' + error);
        });
    }
  </script>


  route

  router.get('/like/:postid', IsLoggedIn, function (req, res, next) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (user) {
      postModel
        .findOne({ _id: req.params.postid })
        .then(function (post) {
          if (post.likes.indexOf(user._id) === -1) {
            post.likes.push(user._id);
          } else {
            post.likes.splice(post.likes.indexOf(user._id), 1);
          }
          post.save()
            .then(function () {
              res.json({ success: true, message: 'Like action successful' });
            })
            .catch(function (error) {
              res.json({ success: false, message: 'Error saving post', error: error });
            });
        })
        .catch(function (error) {
          res.json({ success: false, message: 'Error finding post', error: error });
        });
    })
    .catch(function (error) {
      res.json({ success: false, message: 'Error finding user', error: error });
    });
});
  
  