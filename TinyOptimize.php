<?php
require_once("vendor/autoload.php");
// CONFIG ------------------

const tinyKey = '';

// All - empty array, OR: 'image/jpeg', 'image/png', 'image/webp'
const allowedTypes = ['image/jpeg', 'image/png'];

// If empty - file not created
const LOG_FILE_NAME = 'log_tiny_optimize.log';

// Max: 300kb
const maxFileSize = 300 * 1024;

const maxAllowedCompressForMonth = 500;
const tinyDashboardUrl = 'https://tinify.com/dashboard';

// IF TEST_MODE: true, set define TEST_MODE_MAX_COUNT
// Each month allowed 500 quotes on the FREE plan
const TEST_MODE = true;
const TEST_MODE_MAX_COUNT = 3;

// Set you dir to optimize images
$dir = '';

// END ------------------
function showMsg($message)
{
  $msg = '[ ' . date("Y-m-d H:i:s") . ' ] ' . $message . PHP_EOL;
  
  print($msg);
  
  if (!empty(LOG_FILE_NAME)) {
    file_put_contents(__DIR__ . '/' . LOG_FILE_NAME, $msg, FILE_APPEND);
  }
}
function showResult($numberOfOptimized, $numberOfFindOptimized)
{
  $leftCount = maxAllowedCompressForMonth - \Tinify\compressionCount();
  
  echo PHP_EOL;
  showMsg('--------------');
  showMsg('AllowedTypes: ' . (!empty(allowedTypes) ? implode(', ', allowedTypes) : 'All'));
  showMsg("Optimized: $numberOfOptimized");
  showMsg("Finded for Optimized: $numberOfFindOptimized");
  showMsg('Compression count left at the month: ' . $leftCount);
  
  if ($leftCount <= 0) {
    showMsg('Check ' . tinyDashboardUrl);
  }
  
  showMsg('--------------');
  echo PHP_EOL;
  die();
}
function scanDirectory($dir, &$numberOfFindOptimized, &$pathList)
{
  if (!is_dir($dir)) {
    showMsg("Folder [ $dir ] not exists.");
    return;
  }
  
  $files = scandir($dir);
  
  foreach ($files as $file) {
    if ($file === '.' || $file === '..') {
      continue;
    }
    
    $path = $dir . $file;
    if (TEST_MODE) {
      if ($numberOfFindOptimized < TEST_MODE_MAX_COUNT) {
        scanDirectoryProcessing($path, $numberOfFindOptimized, $pathList);
      }
    } else {
      scanDirectoryProcessing($path, $numberOfFindOptimized, $pathList);
    }
  }
}
function scanDirectoryProcessing($path, &$numberOfFindOptimized, &$pathList)
{
  if (is_dir($path)) {
    scanDirectory($path . '/', $numberOfFindOptimized, $pathList);
  } else {
    $size = filesize($path);
    
    $needOptimize = true;
    
    $imageInfo = @getimagesize($path);
    
    if ($imageInfo !== false && isset($imageInfo['mime'])) {
      $mimeType = $imageInfo['mime'];
      
      
      if (!empty(allowedTypes) && !in_array($mimeType, allowedTypes)) {
        $needOptimize = false;
      }
      
      if ($size > maxFileSize && $needOptimize) {
        $pathList[] = $path;
        $numberOfFindOptimized++;
      }
    }
  }
}
if (empty(tinyKey)) {
  showMsg('Please set $tinyKey');
  showMsg('Check ' . tinyDashboardUrl);
  die();
} else {
  try {
    \Tinify\setKey(tinyKey);
    \Tinify\validate();
  } catch (\Tinify\Exception $e) {
    showMsg("The error message is: " . $e->getMessage());
    showMsg('Check ' . tinyDashboardUrl);
    die();
  }
  
  $pathList = [];
  
  $numberOfOptimized = $numberOfFindOptimized = 0;
  
  scanDirectory($dir, $numberOfFindOptimized, $pathList);
  
  if (!empty($pathList)) {
    $count = count($pathList);
    
    foreach ($pathList as $path) {
      try {
        $numberOfOptimized++;
        
        showMsg("# $numberOfOptimized/$count, File: $path");
        
        showMsg("Send file to optimize");
        $source = \Tinify\fromFile($path);
        
        showMsg("Saved optimized file");
        $source->toFile($path);
        echo PHP_EOL;
        
      } catch (\Tinify\AccountException $e) {
        showMsg("AccountException Error: " . $e->getMessage());
        showResult($numberOfOptimized, $numberOfFindOptimized);
      } catch (\Tinify\ClientException $e) {
        showMsg("ClientException Error: " . $e->getMessage());
        showResult($numberOfOptimized, $numberOfFindOptimized);
      } catch (\Tinify\ServerException $e) {
        showMsg("ServerException Error: " . $e->getMessage());
        showResult($numberOfOptimized, $numberOfFindOptimized);
      } catch (\Tinify\ConnectionException $e) {
        showMsg("ConnectionException Error: " . $e->getMessage());
        showResult($numberOfOptimized, $numberOfFindOptimized);
      } catch (Exception $e) {
        showMsg("Common Error: " . $e->getMessage());
        showResult($numberOfOptimized, $numberOfFindOptimized);
      }
    }
  }
  
  showResult($numberOfOptimized, $numberOfFindOptimized);
}
