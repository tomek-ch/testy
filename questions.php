<?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $category = trim(htmlspecialchars(stripslashes($_POST['category'])));
        $amount = trim(htmlspecialchars(stripslashes($_POST['amount'])));

        $mysqli = new mysqli('localhost', 'root', '', 'testy') or die(mysqli_error($mysqli));
        $query =
        "SELECT `Pytanie`, `Odpowiedź A`, `Odpowiedź B`, `Odpowiedź C`, `Poprawna odp`, `Media`, `Liczba punktów`
        FROM `pytania`
        WHERE `Kategorie` LIKE '%{$category}%'
        ORDER BY RAND()
        LIMIT {$amount}";
        $result = $mysqli->query($query) or die($mysqli->error);
    
        if ($result) {
            while($row = mysqli_fetch_assoc($result)) {
                $rows[] = $row;
            }
            print json_encode($rows);
        }
    }
?>