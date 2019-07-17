<?php

namespace Drupal\crosscut_logger\Logger;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Logger\LogMessageParserInterface;
use Drupal\Core\Logger\RfcLoggerTrait;
use Drupal\Core\Mail\MailManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * Class CrosscutLog
 *
 * @package Drupal\crosscut_logger\Logger
 */
class CrosscutLog implements LoggerInterface {
  use RfcLoggerTrait;
  use DependencySerializationTrait;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ImmutableConfig
   */
  protected $config;

  /**
   * The message's placeholders parser.
   *
   * @var \Drupal\Core\Logger\LogMessageParserInterface
   */
  protected $parser;

  /**
   * The mail manager.
   *
   * @var \Drupal\Core\Mail\MailManagerInterface
   */
  protected $mailManager;

  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * Constructs a CrosscutLog object.
   *
   * @param \Drupal\Core\Logger\LogMessageParserInterface $parser
   *   The parser to use when extracting message variables.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory for getting module config.
   */
  public function __construct(LogMessageParserInterface $parser,
                              ConfigFactoryInterface $config_factory,
                              MailManagerInterface $mail_manager,
                              LanguageManagerInterface $language_manager) {
    $this->parser = $parser;
    $this->config = $config_factory->get('crosscut_logger.settings');
    $this->mailManager = $mail_manager;
    $this->languageManager = $language_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function log($level, $message, array $context = []) {
    if (!$this->config->get('enable')) {
      return;
    }

    $filter_level = $this->config->get('level');
    if (!empty($filter_level) && !isset($filter_level[$level])) {
      return;
    }

    $filter_type = $this->config->get('type');
    if (!empty($filter_type) && !in_array($context['channel'], $filter_type)) {
      return;
    }

    // Remove any backtraces since they may contain an unserializable variable.
    unset($context['backtrace']);

    // Convert PSR3-style messages to \Drupal\Component\Render\FormattableMarkup
    // style, so they can be translated too in runtime.
    $message_placeholders = $this->parser->parseMessagePlaceholders($message, $context);
    if (!empty($message_placeholders)) {
      $message = strtr($message, $message_placeholders);
    }

    $mailto = $this->config->get('mailto');

    if (!empty($mailto)) {
      $this->mailManager->mail(
        'crosscut_logger',
        'log_notification',
        $mailto,
        $this->languageManager->getDefaultLanguage()->getId(),
        ['message' => $message, 'context' => $context]
      );
    }
  }

}
