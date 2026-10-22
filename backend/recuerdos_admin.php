<?php
require __DIR__.'/recuerdos_comun.php';
$mensaje='';
try {
 if ($_SERVER['REQUEST_METHOD']==='POST') {
  csrf(); $accion=$_POST['accion'] ?? '';
  if ($accion==='ingresar') {
   limitar('login',10,900);
   if ($config['clave_hash'] && is_string($_POST['clave'] ?? null) && password_verify($_POST['clave'],$config['clave_hash'])) {
    session_regenerate_id(true); $_SESSION['recuerdos_admin']=true; $_SESSION['recuerdos_admin_hasta']=time()+7200;
   } else $mensaje='La contraseña no es correcta o el acceso no está configurado.';
  } elseif ($accion==='salir') {
   unset($_SESSION['recuerdos_admin'],$_SESSION['recuerdos_admin_hasta']); session_regenerate_id(true);
  } elseif (administrador() && in_array($accion,['aprobado','rechazado'],true)) {
   $id=filter_var($_POST['id'] ?? null,FILTER_VALIDATE_INT);
   if (!$id || $id<1) throw new RuntimeException('ID inválido');
   $q=conexion()->prepare("UPDATE recuerdos SET estado=?,revisado_en=NOW() WHERE id=? AND estado='pendiente'");
   $q->execute([$accion,$id]);
   $_SESSION['recuerdos_mensaje']=$q->rowCount() ? 'Recuerdo '.$accion.'.' : 'Este recuerdo ya fue revisado.';
   header('Location: recuerdos_admin.php'); exit;
  } else { http_response_code(403); $mensaje='Acción no autorizada.'; }
 }
 if (isset($_SESSION['recuerdos_mensaje'])) { $mensaje=$_SESSION['recuerdos_mensaje']; unset($_SESSION['recuerdos_mensaje']); }
 $estado=$_GET['estado'] ?? 'pendiente';
 if (!in_array($estado,['pendiente','aprobado','rechazado'],true)) $estado='pendiente';
 $pagina=max(1,(int)($_GET['pagina'] ?? 1)); $filas=[];
 if (administrador()) {
  $q=conexion()->prepare('SELECT id,nombre,email,vinculo,titulo,relato,anio,estado,creado_en FROM recuerdos WHERE estado=? ORDER BY creado_en DESC,id DESC LIMIT 21 OFFSET '.(($pagina-1)*20));
  $q->execute([$estado]); $filas=$q->fetchAll();
 }
} catch(Throwable $e) { error_log($e->getMessage()); $mensaje='No se pudo completar la operación. Revisá la conexión y la migración SQL.'; }
?>
<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Revisión de recuerdos · IPET 50</title><link rel="stylesheet" href="../src/styles/web_styles.css"><link rel="stylesheet" href="../src/components/Galeria/recuerdos_formulario.css"></head>
<body class="mem-page"><main class="mem-shell"><a href="../src/components/Galeria/Galeria.html">← Volver a la galería</a><h1>Revisión de recuerdos</h1><p>Solo los recuerdos aprobados se muestran públicamente.</p>
<?php if ($mensaje): ?><p class="mem-notice" role="status"><?=escapar($mensaje)?></p><?php endif; ?>
<?php if (!administrador()): ?>
<form method="post" class="mem-panel"><input type="hidden" name="csrf" value="<?=escapar($_SESSION['recuerdos_csrf'])?>"><input type="hidden" name="accion" value="ingresar"><label>Contraseña del responsable<input type="password" name="clave" required autocomplete="current-password"></label><button type="submit">Ingresar</button></form>
<?php else: ?>
<form method="post"><input type="hidden" name="csrf" value="<?=escapar($_SESSION['recuerdos_csrf'])?>"><button name="accion" value="salir">Cerrar sesión</button></form>
<nav class="mem-actions" aria-label="Estado de los recuerdos"><?php foreach(['pendiente'=>'Pendientes','aprobado'=>'Aprobados','rechazado'=>'Rechazados'] as $valor=>$etiqueta): ?><a href="?estado=<?=$valor?>" <?= $estado===$valor ? 'aria-current="page"' : '' ?>><?=$etiqueta?></a><?php endforeach; ?></nav>
<?php if (!$filas): ?><p class="mem-notice">No hay recuerdos en este estado.</p><?php endif; ?>
<?php foreach(array_slice($filas,0,20) as $r): ?>
<article class="mem-panel"><span class="mem-badge"><?=escapar($r['estado'])?></span><h2><?=escapar($r['titulo'])?></h2><p><?=escapar($r['nombre'])?> · <?=escapar($r['vinculo'])?> · <?=escapar($r['anio'])?></p><p>Contacto privado: <?=escapar($r['email'])?></p><p>Recibido: <?=escapar($r['creado_en'])?></p><img class="mem-preview" loading="lazy" src="recuerdos.php?imagen=<?=(int)$r['id']?>" alt="Fotografía enviada"><p class="mem-relato"><?=escapar($r['relato'])?></p>
<?php if ($estado==='pendiente'): ?><form method="post" class="mem-actions"><input type="hidden" name="csrf" value="<?=escapar($_SESSION['recuerdos_csrf'])?>"><input type="hidden" name="id" value="<?=(int)$r['id']?>"><button name="accion" value="aprobado">Aprobar y publicar</button><button class="mem-secondary" name="accion" value="rechazado">Rechazar</button></form><?php endif; ?></article>
<?php endforeach; ?><nav class="mem-actions" aria-label="Paginación"><?php if($pagina>1): ?><a href="?estado=<?=$estado?>&pagina=<?=$pagina-1?>">Anterior</a><?php endif; ?><?php if(count($filas)>20): ?><a href="?estado=<?=$estado?>&pagina=<?=$pagina+1?>">Siguiente</a><?php endif; ?></nav>
<?php endif; ?></main></body></html>
