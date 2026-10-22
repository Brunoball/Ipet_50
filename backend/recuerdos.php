<?php
require __DIR__.'/recuerdos_comun.php';
try {
    $metodo=$_SERVER['REQUEST_METHOD'];
    if ($metodo==='GET' && isset($_GET['sesion'])) respuesta(['csrf'=>$_SESSION['recuerdos_csrf']]);
    if ($metodo==='GET' && isset($_GET['imagen'])) {
        $id=filter_var($_GET['imagen'],FILTER_VALIDATE_INT);
        if (!$id || $id<1) respuesta(['error'=>'Imagen no disponible.'],404);
        $q=conexion()->prepare('SELECT imagen,imagen_tipo FROM recuerdos WHERE id=?'.(administrador() ? '' : " AND estado='aprobado'"));
        $q->execute([$id]); $r=$q->fetch();
        if (!$r) respuesta(['error'=>'Imagen no disponible.'],404);
        header('Content-Type: '.$r['imagen_tipo']); echo $r['imagen']; exit;
    }
    if ($metodo==='GET') {
        $limite=max(1,min(24,(int)($_GET['limite'] ?? 12)));
        $pagina=max(1,(int)($_GET['pagina'] ?? 1)); $offset=($pagina-1)*$limite;
        $q=conexion()->query("SELECT id,nombre,vinculo,titulo,relato,anio FROM recuerdos WHERE estado='aprobado' ORDER BY revisado_en DESC,id DESC LIMIT ".($limite+1)." OFFSET $offset");
        $filas=$q->fetchAll(); $mas=count($filas)>$limite;
        respuesta(['recuerdos'=>array_slice($filas,0,$limite),'mas'=>$mas]);
    }
    if ($metodo!=='POST') respuesta(['error'=>'Método no permitido.'],405);
    csrf(); limitar('envios',5,3600);
    if (!empty($_POST['sitio_web'])) respuesta(['error'=>'Solicitud inválida.'],422);
    $nombre=campo('nombre',2,100); $email=campo('email',3,254);
    $vinculo=campo('vinculo',2,60); $titulo=campo('titulo',3,140); $relato=campo('relato',20,3000);
    if (!filter_var($email,FILTER_VALIDATE_EMAIL)) respuesta(['error'=>'Ingresá un correo válido.'],422);
    if (!in_array($vinculo,['Estudiante','Egresado/a','Docente','Familia','Personal de la escuela','Otro'],true)) respuesta(['error'=>'Vínculo inválido.'],422);
    $anio=campo('anio',0,4);
    if ($anio!=='' && (!ctype_digit($anio) || (int)$anio<1900 || (int)$anio>(int)date('Y'))) respuesta(['error'=>'Revisá el año del recuerdo.'],422);
    if (($_POST['consentimiento'] ?? '')!=='1') respuesta(['error'=>'Debés autorizar la publicación.'],422);
    $foto=$_FILES['foto'] ?? null;
    if (!$foto || is_array($foto['error']) || $foto['error']!==UPLOAD_ERR_OK || $foto['size']>3*1024*1024 || !is_uploaded_file($foto['tmp_name'])) respuesta(['error'=>'Adjuntá una imagen JPG, PNG o WebP de hasta 3 MB.'],422);
    $tipo=(new finfo(FILEINFO_MIME_TYPE))->file($foto['tmp_name']);
    $medidas=@getimagesize($foto['tmp_name']);
    if (!in_array($tipo,['image/jpeg','image/png','image/webp'],true) || !$medidas || $medidas[0]>8000 || $medidas[1]>8000) respuesta(['error'=>'La imagen no es válida o supera 8000 píxeles por lado.'],422);
    $q=conexion()->prepare("INSERT INTO recuerdos (nombre,email,vinculo,titulo,relato,anio,imagen,imagen_tipo,estado) VALUES (?,?,?,?,?,?,?,?,'pendiente')");
    $q->execute([$nombre,$email,$vinculo,$titulo,$relato,$anio===''?null:(int)$anio,file_get_contents($foto['tmp_name']),$tipo]);
    $id=conexion()->lastInsertId();
    // El aviso nunca aprueba ni publica. Si falla, el envío permanece en la bandeja.
    if (filter_var($config['correo_revision'],FILTER_VALIDATE_EMAIL) && function_exists('mail')) {
        $aviso="Hay un nuevo recuerdo pendiente (#$id). Ingresá al panel para revisarlo.\n".$config['url_panel'];
        try {
            if (!@mail($config['correo_revision'],'Nuevo recuerdo pendiente - IPET 50',$aviso,"Content-Type: text/plain; charset=UTF-8")) error_log('Recuerdos: no se pudo enviar el aviso #'.$id);
        } catch (Throwable $e) { error_log('Recuerdos: aviso no enviado #'.$id); }
    }
    respuesta(['mensaje'=>'¡Gracias por compartir! Tu recuerdo quedó pendiente de revisión. Se publicará únicamente cuando sea aprobado.'],201);
} catch (Throwable $e) { error_log('Recuerdos: '.$e->getMessage()); respuesta(['error'=>'No pudimos completar la solicitud. Intentá nuevamente más tarde.'],500); }
