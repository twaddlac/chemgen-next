<?php
/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package WPAdmin
 */

?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="http://gmpg.org/xfn/11">

	<?php wp_head(); ?>


    <!--    TODO These will be added to the angular app-->
<!--    <!-- Bootstrap -->-->
<!--    <link href="--><?php //echo(bloginfo('template_directory'))?><!--/node_modules/gentelella/vendors/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">-->
<!--    <!-- Font Awesome -->-->
<!--    <link href="--><?php //echo(bloginfo('template_directory'))?><!--/node_modules/gentelella/vendors/font-awesome/css/font-awesome.min.css" rel="stylesheet">-->
<!--    <!-- NProgress -->-->
<!--    <link href="--><?php //echo(bloginfo('template_directory'))?><!--/node_modules/gentelella/vendors/nprogress/nprogress.css" rel="stylesheet">-->
<!---->
<!--    <!-- Custom Theme Style -->-->
<!--    <link href="--><?php //echo(bloginfo('template_directory'))?><!--/node_modules/gentelella/build/css/custom.min.css" rel="stylesheet">-->
    <link href="<?php echo(bloginfo('template_directory'))?>/js/ng/styles.css" rel="stylesheet">

</head>

<body <?php body_class('nav-md'); ?>>
<div id="page" class="container body">
	<div id="content" class="main_container">
