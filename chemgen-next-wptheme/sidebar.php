<?php
/**
 * The sidebar containing the main widget area
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package WPAdmin
 * This is the original get sidebar, which I mostly don't want
if ( ! is_active_sidebar( 'sidebar-1' ) ) {
	return;
}
?>
<aside id="secondary" class="widget-area">
	<?php dynamic_sidebar( 'sidebar-1' ); ?>
</aside><!-- #secondary -->
 */
?>

<!--        Side Bar Navigation-->
<div class="col-md-3 left_col">
    <div class="left_col scroll-view">
        <div class="navbar nav_title" style="border: 0;">
            <a href="index.html" class="site_title"><i class="fa fa-paw"></i> <span>ChemGen</span></a>
        </div>

        <div class="clearfix"></div>

        <!-- menu profile quick info -->
        <div class="profile clearfix">
            <?php
            if ( is_user_logged_in() ) {
                $current_user = wp_get_current_user();
                ?>
                <div class="profile_info">
                    <span>Welcome,</span>
                    <h2><?php $current_user->display_name ?></h2>
                </div>
                <?php
            } else {
                ?>
                <div class="profile_info">
                    <h2>Log in!</h2>
                </div>
                <?php
            }
            ?>
            <div class="clearfix"></div>
        </div>
        <!-- /menu profile quick info -->

        <br />

        <!-- sidebar menu -->
        <div id="sidebar-menu" class="main_menu_side hidden-print main_menu">
            <div class="menu_section">
                <h3>Ahringer Library RNAi Screens</h3>
                <ul class="nav side-menu">
                    <li><a><i class="fa fa-home"></i> Primary <span class="fa fa-chevron-down"></span></a>
                        <ul class="nav child_menu">
                            <li><a href="<?php echo(get_bloginfo('wpurl')) ?>/rnai-ahringer2-primary-restrictive/">mel-28 Whole Genome Wide Restrictive</a></li>
                            <li><a href="<?php echo(get_bloginfo('wpurl')) ?>/rnai-ahringer2-primary-permissive/">mel-28 Whole Genome Wide Permissive</a></li>
                            <li><a href="<?php echo(get_bloginfo('wpurl')) ?>/rnai-mip-1mip-2-primary-permissive/">mip-1;mip-2 Whole Genome Wide Permissive</a></li>
                            <li><a href="<?php echo(get_bloginfo('wpurl')) ?>/rnai-mip-1mip-2-primary-restrictive/">mip-1;mip-2 Whole Genome Wide Restrictive</a></li>
                        </ul>
                    </li>
                    <li><a><i class="fa fa-home"></i>Secondary <span class="fa fa-chevron-down"></span></a>
                        <ul class="nav child_menu">
                            <li><a href="<?php echo(get_bloginfo('wpurl')) ?>/rnai-secondary-screen-page/">Secondary</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
        <!-- /sidebar menu -->

        <!-- /menu footer buttons -->
        <div class="sidebar-footer hidden-small">
            <a data-toggle="tooltip" data-placement="top" title="Settings">
                <span class="glyphicon glyphicon-cog" aria-hidden="true"></span>
            </a>
            <a data-toggle="tooltip" data-placement="top" title="FullScreen">
                <span class="glyphicon glyphicon-fullscreen" aria-hidden="true"></span>
            </a>
            <a data-toggle="tooltip" data-placement="top" title="Lock">
                <span class="glyphicon glyphicon-eye-close" aria-hidden="true"></span>
            </a>
            <a data-toggle="tooltip" data-placement="top" title="Logout" href="login.html">
                <span class="glyphicon glyphicon-off" aria-hidden="true"></span>
            </a>
        </div>
        <!-- /menu footer buttons -->
    </div>
</div>
<!--        /Side Bar Navigation-->

<!-- top navigation -->
<div class="top_nav">
    <div class="nav_menu">
        <nav>
            <div class="nav toggle">
                <a id="menu_toggle"><i class="fa fa-bars"></i></a>
            </div>

            <ul class="nav navbar-nav navbar-right">
                <li></li>
            </ul>
        </nav>
    </div>
</div>
<!-- /top navigation -->
