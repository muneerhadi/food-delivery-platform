Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'assets\images\onboarding'

function New-PenArgb($a, $r, $g, $b, $w = 1) {
  return [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb($a, $r, $g, $b), $w)
}

function New-BrushArgb($a, $r, $g, $b) {
  return [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb($a, $r, $g, $b))
}

function New-RoundRectPath($x, $y, $w, $h, $r) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundRect($g, $brush, $x, $y, $w, $h, $r) {
  $path = New-RoundRectPath $x $y $w $h $r
  $g.FillPath($brush, $path)
  $path.Dispose()
}

function Stroke-RoundRect($g, $pen, $x, $y, $w, $h, $r) {
  $path = New-RoundRectPath $x $y $w $h $r
  $g.DrawPath($pen, $path)
  $path.Dispose()
}

function Use-Canvas($fileName, [scriptblock]$draw) {
  $bmp = [System.Drawing.Bitmap]::new(1100, 800, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear([System.Drawing.Color]::Transparent)
  & $draw $g
  $path = Join-Path $outDir $fileName
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

function Draw-Leaf($g, $x, $y, $w, $h, $angle, $color) {
  $state = $g.Save()
  $g.TranslateTransform($x + $w / 2, $y + $h / 2)
  $g.RotateTransform($angle)
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddBezier(-$w / 2, 0, -$w / 4, -$h / 2, $w / 2, -$h / 2, $w / 2, 0)
  $path.AddBezier($w / 2, 0, $w / 4, $h / 2, -$w / 2, $h / 2, -$w / 2, 0)
  $brush = [System.Drawing.SolidBrush]::new($color)
  $g.FillPath($brush, $path)
  $g.DrawPath((New-PenArgb 130 37 92 65 2), $path)
  $brush.Dispose()
  $path.Dispose()
  $g.Restore($state)
}

function Draw-SoftShadow($g, $x, $y, $w, $h) {
  for ($i = 0; $i -lt 9; $i++) {
    $alpha = 28 - ($i * 3)
    $brush = New-BrushArgb $alpha 22 62 48
    $g.FillEllipse($brush, $x - $i * 10, $y - $i * 4, $w + $i * 20, $h + $i * 8)
    $brush.Dispose()
  }
}

function Draw-FoodBowl {
  param($g)
  Draw-SoftShadow $g 250 640 600 58
  $blob = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $blob.AddBezier(205, 165, 345, 70, 805, 95, 890, 245)
  $blob.AddBezier(1000, 430, 900, 570, 725, 650, 520, 665)
  $blob.AddBezier(260, 675, 140, 610, 115, 450, 180, 330)
  $blob.CloseFigure()
  $g.FillPath((New-BrushArgb 235 255 255 255), $blob)
  $g.DrawPath((New-PenArgb 255 255 255 255 18), $blob)
  $blob.Dispose()

  $g.FillEllipse((New-BrushArgb 255 238 235 228), 250, 165, 590, 455)
  $g.FillEllipse((New-BrushArgb 255 255 255 255), 285, 190, 520, 395)
  $g.FillEllipse((New-BrushArgb 255 220 234 216), 330, 230, 430, 310)

  $greens = @(
    @(355, 280, 95, 70), @(440, 245, 110, 76), @(610, 260, 115, 80),
    @(360, 410, 130, 86), @(565, 430, 145, 78), @(690, 365, 90, 65)
  )
  foreach ($leaf in $greens) {
    $g.FillEllipse((New-BrushArgb 255 45 132 74), $leaf[0], $leaf[1], $leaf[2], $leaf[3])
    $g.FillEllipse((New-BrushArgb 230 124 181 89), $leaf[0] + 22, $leaf[1] + 13, $leaf[2] - 34, $leaf[3] - 24)
  }

  foreach ($c in @(@(505, 430), @(710, 330), @(405, 455), @(650, 470))) {
    $g.FillEllipse((New-BrushArgb 255 217 76 42), $c[0], $c[1], 42, 42)
    $g.FillEllipse((New-BrushArgb 200 255 226 167), $c[0] + 10, $c[1] + 9, 16, 16)
  }

  foreach ($a in @(@(575, 395), @(622, 405), @(668, 418), @(712, 432))) {
    $g.FillEllipse((New-BrushArgb 255 143 190 92), $a[0], $a[1], 68, 38)
    $g.DrawArc((New-PenArgb 180 72 121 64 3), $a[0] + 10, $a[1] + 8, 46, 18, 0, 180)
  }

  $chicken = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $chicken.AddBezier(420, 270, 505, 210, 650, 255, 705, 345)
  $chicken.AddBezier(730, 405, 675, 455, 555, 450, 505, 425)
  $chicken.AddBezier(410, 405, 350, 370, 360, 305, 420, 270)
  $chicken.CloseFigure()
  $g.FillPath((New-BrushArgb 255 255 213 151), $chicken)
  $g.DrawPath((New-PenArgb 255 240 153 73 5), $chicken)
  for ($x = 445; $x -le 650; $x += 48) {
    $g.DrawLine((New-PenArgb 230 111 74 37 8), $x, 268, $x + 60, 405)
  }
  $chicken.Dispose()

  foreach ($s in @(@(385, 340), @(480, 475), @(565, 305), @(735, 410), @(450, 525))) {
    $g.FillEllipse((New-BrushArgb 255 239 214 146), $s[0], $s[1], 14, 14)
  }
}

function Draw-RestaurantCard($g, $x, $y, $w, $h, $angle, $name, $rating, $dishColor) {
  $state = $g.Save()
  $g.TranslateTransform($x + $w / 2, $y + $h / 2)
  $g.RotateTransform($angle)
  $g.TranslateTransform(-$w / 2, -$h / 2)
  Draw-SoftShadow $g 20 ($h - 18) ($w - 40) 28
  Fill-RoundRect $g (New-BrushArgb 255 255 255 255) 0 0 $w $h 42
  Stroke-RoundRect $g (New-PenArgb 255 232 236 232 3) 0 0 $w $h 42
  $g.FillEllipse((New-BrushArgb 255 $dishColor[0] $dishColor[1] $dishColor[2]), 43, 35, ($w - 86), ($w - 86))
  $g.FillEllipse((New-BrushArgb 255 255 244 220), 75, 66, ($w - 150), ($w - 150))
  for ($i = 0; $i -lt 14; $i++) {
    $rx = 85 + (($i * 43) % [int]($w - 170))
    $ry = 78 + (($i * 29) % [int]($w - 175))
    $g.FillEllipse((New-BrushArgb 235 45 132 74), $rx, $ry, 24, 18)
    $g.FillEllipse((New-BrushArgb 235 218 78 42), $rx + 18, $ry + 18, 18, 18)
  }
  Fill-RoundRect $g (New-BrushArgb 245 246 249 244) ($w - 112) 35 88 45 18
  $star = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $star.AddPolygon([System.Drawing.Point[]]@(
    [System.Drawing.Point]::new($w - 96, 52), [System.Drawing.Point]::new($w - 88, 52),
    [System.Drawing.Point]::new($w - 84, 44), [System.Drawing.Point]::new($w - 80, 52),
    [System.Drawing.Point]::new($w - 71, 52), [System.Drawing.Point]::new($w - 78, 58),
    [System.Drawing.Point]::new($w - 75, 67), [System.Drawing.Point]::new($w - 84, 62),
    [System.Drawing.Point]::new($w - 92, 67), [System.Drawing.Point]::new($w - 89, 58)
  ))
  $g.FillPath((New-BrushArgb 255 230 165 67), $star)
  $star.Dispose()
  $fontBold = [System.Drawing.Font]::new('Arial', 27, [System.Drawing.FontStyle]::Bold)
  $fontSmall = [System.Drawing.Font]::new('Arial', 16, [System.Drawing.FontStyle]::Regular)
  $g.DrawString($rating, $fontSmall, (New-BrushArgb 255 24 41 35), ($w - 66), 47)
  $g.DrawString($name, $fontBold, (New-BrushArgb 255 24 41 35), 48, ($w - 25))
  $g.DrawString('Fresh - Local - Tasty', $fontSmall, (New-BrushArgb 255 77 88 84), 50, ($w + 14))
  foreach ($chip in @(@('Grill', 50), @('Healthy', 130), @('Bowls', 230))) {
    Fill-RoundRect $g (New-BrushArgb 255 220 235 218) $chip[1] ($w + 54) 70 32 16
    $g.DrawString($chip[0], $fontSmall, (New-BrushArgb 255 58 82 72), ($chip[1] + 13), ($w + 60))
  }
  $fontBold.Dispose()
  $fontSmall.Dispose()
  $g.Restore($state)
}

function Draw-Restaurants {
  param($g)
  Draw-RestaurantCard $g 95 160 285 430 -8 'GreenCart' '4.6' @(227, 133, 74)
  Draw-RestaurantCard $g 408 95 315 485 0 'Savor Kitchen' '4.8' @(76, 145, 78)
  Draw-RestaurantCard $g 740 175 285 430 9 'Bite House' '4.5' @(226, 157, 68)
}

function Draw-Tracking {
  param($g)
  Draw-SoftShadow $g 155 640 330 50
  $g.FillEllipse((New-BrushArgb 255 34 96 69), 180, 210, 190, 170)
  $g.FillEllipse((New-BrushArgb 255 244 211 175), 292, 260, 78, 92)
  $g.FillEllipse((New-BrushArgb 255 14 78 57), 175, 190, 230, 120)
  $g.DrawArc((New-PenArgb 255 255 255 255 8), 230, 220, 80, 38, 180, 150)
  Fill-RoundRect $g (New-BrushArgb 255 7 84 58) 170 345 235 250 35
  Fill-RoundRect $g (New-BrushArgb 255 10 98 67) 75 360 190 235 26
  Stroke-RoundRect $g (New-PenArgb 255 20 50 40 7) 75 360 190 235 26
  $g.FillEllipse((New-BrushArgb 255 18 42 36), 170, 595, 285, 55)
  $g.DrawEllipse((New-PenArgb 255 24 32 30 9), 265, 555, 110, 110)
  $g.DrawEllipse((New-PenArgb 255 24 32 30 9), 405, 555, 110, 110)
  $g.DrawLine((New-PenArgb 255 24 32 30 9), 315, 605, 460, 600)
  $g.DrawEllipse((New-PenArgb 255 30 44 40 5), 435, 310, 85, 60)
  $g.DrawLine((New-PenArgb 255 30 44 40 5), 410, 385, 475, 335)

  Fill-RoundRect $g (New-BrushArgb 255 255 255 255) 505 185 460 360 30
  Stroke-RoundRect $g (New-PenArgb 255 232 236 232 4) 505 185 460 360 30
  for ($x = 535; $x -lt 940; $x += 72) { $g.DrawLine((New-PenArgb 255 230 232 228 4), $x, 205, ($x + 40), 515) }
  for ($y = 220; $y -lt 520; $y += 58) { $g.DrawLine((New-PenArgb 255 230 232 228 4), 520, $y, 945, ($y - 25)) }
  $routePen = New-PenArgb 255 13 94 64 9
  $routePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $routePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawLines($routePen, [System.Drawing.Point[]]@(
    [System.Drawing.Point]::new(585, 265), [System.Drawing.Point]::new(675, 265),
    [System.Drawing.Point]::new(680, 340), [System.Drawing.Point]::new(770, 340),
    [System.Drawing.Point]::new(775, 430), [System.Drawing.Point]::new(890, 430)
  ))
  $routePen.Dispose()
  $g.FillEllipse((New-BrushArgb 255 204 139 12), 560, 242, 52, 52)
  $g.FillEllipse((New-BrushArgb 255 44 127 73), 870, 402, 52, 52)
  Fill-RoundRect $g (New-BrushArgb 255 238 247 241) 565 465 120 72 12
  $fontBold = [System.Drawing.Font]::new('Arial', 23, [System.Drawing.FontStyle]::Bold)
  $fontSmall = [System.Drawing.Font]::new('Arial', 17, [System.Drawing.FontStyle]::Regular)
  $g.DrawString('On the way', $fontBold, (New-BrushArgb 255 13 65 48), 710, 468)
  $g.DrawString('Arriving in 12 min', $fontSmall, (New-BrushArgb 255 192 126 7), 710, 507)
  $fontBold.Dispose()
  $fontSmall.Dispose()
}

Use-Canvas 'fresh_food.png' ${function:Draw-FoodBowl}
Use-Canvas 'restaurants.png' ${function:Draw-Restaurants}
Use-Canvas 'tracking.png' ${function:Draw-Tracking}
