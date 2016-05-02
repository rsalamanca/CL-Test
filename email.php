<?php $name = $_POST['name'];
$email = $_POST['email'];
$message = "message from: " + $email;
$formcontent="From:$email \n";
$recipient = "salamancaronito@gmail.com";
$subject = "Contact Form";
$mailheader = "From: $email \r\n";
mail($recipient, $subject, $formcontent, $mailheader) or die("Error!");
echo "Thank You!";
?>