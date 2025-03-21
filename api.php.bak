<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "collaborative_story";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    parse_str(file_get_contents("php://input"), $post_vars);
    if (isset($post_vars['add_story'])) {
        $user = $conn->real_escape_string($post_vars['user']);
        $text = $conn->real_escape_string($post_vars['text']);
        $sql = "INSERT INTO story (user, text) VALUES ('$user', '$text')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "New story entry added successfully."]);
        } else {
            echo json_encode(["error" => "Error: " . $sql . "<br>" . $conn->error]);
        }
    } elseif (isset($post_vars['name'])) {
        $name = $conn->real_escape_string($post_vars['name']);
        // Set the new user as active if they are the only user
        $is_active = $conn->query("SELECT COUNT(*) as count FROM users")->fetch_assoc()['count'] == 0 ? '1' : '0';
        $sql = "INSERT INTO users (name, is_active) VALUES ('$name', '$is_active') ON DUPLICATE KEY UPDATE is_active='$is_active', last_active=NOW()";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "User added/updated successfully."]);
        } else {
            echo json_encode(["error" => "Error: " . $sql . "<br>" . $conn->error]);
        }
    } elseif (isset($post_vars['set_active'])) {
        $name = $conn->real_escape_string($post_vars['set_active']);
        $conn->query("UPDATE users SET is_active='0'");
        $sql = "UPDATE users SET is_active='1' WHERE name='$name'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Active user set successfully."]);
        } else {
            echo json_encode(["error" => "Error: " . $sql . "<br>" . $conn->error]);
        }
    } elseif (isset($post_vars['set_prompt'])) {
        $prompt = $conn->real_escape_string($post_vars['prompt']);
        $sql = "UPDATE prompts SET prompt='$prompt' WHERE id=1";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Prompt updated successfully."]);
        } else {
            echo json_encode(["error" => "Error: " . $sql . "<br>" . $conn->error]);
        }
    } elseif (isset($post_vars['show_full_story'])) {
        $show_full_story = $conn->real_escape_string($post_vars['show_full_story']);
        $sql = "UPDATE settings SET show_full_story='$show_full_story' WHERE id=1";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Show full story state updated successfully."]);
        } else {
            echo json_encode(["error" => "Error: " . $sql . "<br>" . $conn->error]);
        }
    } elseif (isset($post_vars['action']) && $post_vars['action'] === 'purge_users') {
        $sql = "TRUNCATE TABLE users";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "All users have been purged successfully."]);
        } else {
            echo json_encode(["success" => false, "error" => "Error: " . $sql . "<br>" . $conn->error]);
        }
    } elseif (isset($post_vars['action']) && $post_vars['action'] === 'purge_story') {
        $sql = "TRUNCATE TABLE story";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "All story entries have been purged successfully."]);
        } else {
            echo json_encode(["success" => false, "error" => "Error: " . $sql . "<br>" . $conn->error]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['fetch_story'])) {
        $sql = "SELECT * FROM story ORDER BY id ASC";
        $result = $conn->query($sql);
        $story = [];
        while ($row = $result->fetch_assoc()) {
            $story[] = $row;
        }
        echo json_encode(["story" => $story]);
    } elseif (isset($_GET['fetch_prompt'])) {
        $sql = "SELECT prompt FROM prompts WHERE id=1";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo json_encode(["prompt" => $row['prompt']]);
        } else {
            echo json_encode(["error" => "No prompt found."]);
        }
    } elseif (isset($_GET['fetch_show_full_story'])) {
        $sql = "SELECT show_full_story FROM settings WHERE id=1";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo json_encode(["show_full_story" => (bool)$row['show_full_story']]);
        } else {
            echo json_encode(["error" => "No setting found."]);
        }
    } elseif (isset($_GET['online_users'])) {
        $sql = "SELECT * FROM users WHERE last_active > (NOW() - INTERVAL 5 MINUTE)";
        $result = $conn->query($sql);
        $online_users = [];
        while ($row = $result->fetch_assoc()) {
            $online_users[] = $row;
        }
        echo json_encode(["online_users" => $online_users]);
    } elseif (isset($_GET['username'])) {
        $username = $conn->real_escape_string($_GET['username']);
        $sql = "SELECT * FROM users WHERE name='$username'";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            echo json_encode(["exists" => true]);
        } else {
            echo json_encode(["exists" => false]);
        }
    }
}

$conn->close();
?>