<?php

$isFirefox = $_POST['nav'] === 'firefox';
$fileName = trim($_POST["filename"]);

$dir = 'uploads/';
if (!file_exists($dir) && !is_dir($dir)) {
    mkdir($dir, 0777);
}

if (isset($_FILES["blob"])) {
    // create directory only if not exists
    if (!file_exists($dir) && !is_dir($dir)) {
        mkdir($dir, 0777);
    }

    $url = $dir . '/' . $fileName;

    if (!move_uploaded_file($_FILES["blob"]["tmp_name"], $url)) {
        echo ("problem moving uploaded file");
    } else {
        $fileInfo = pathinfo($url);
        $extension = $fileInfo['extension'];
        $type = 'audio';
        $track = array('type' => $type, 'name' => $fileInfo['filename'], 'url' => $url, 'recorded' => true, 'deletable' => true, 'downloadable' => true, 'extension' => $extension);

        echo json_encode($track);
    }
}
/*
if ($isFirefox) {
    
} else { //Chrome
    if (isset($_FILES["blob-video"])) {
        // create directory only if not exists


        $url = $dir . '/' . $fileName;

        if (!move_uploaded_file($_FILES["blob"]["tmp_name"], $url)) {
            echo ("problem moving uploaded file");
        } else {
            $fileInfo = pathinfo($url);
            $extension = $fileInfo['extension'];
            $type = 'video';
            $track = array('type' => $type, 'name' => $fileInfo['filename'], 'url' => $url, 'recorded' => true, 'deletable' => true, 'downloadable' => true, 'extension' => $extension);

            echo json_encode($track);
        }
    }
}
*/