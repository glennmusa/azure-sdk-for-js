// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { StorageClientContext } from "./generated/src/storageClientContext";
import { Pipeline } from "./Pipeline";
import { escapeURLPath, getAccountNameFromUrl } from "./utils/utils.common";
import { SERVICE_VERSION } from "./utils/constants";
import { SpanOptions } from "@opentelemetry/types";

/**
 * An interface for options common to every remote operation.
 */
export interface CommonOptions {
  tracingOptions?: OperationTracingOptions;
}

export interface OperationTracingOptions {
  /**
   * OpenTelemetry SpanOptions used to create a span when tracing is enabled.
   */
  spanOptions?: SpanOptions;
}

/**
 * A StorageClient represents a base client class for ServiceClient, ContainerClient and etc.
 *
 * @export
 * @class StorageClient
 */
export abstract class StorageClient {
  /**
   * URL string value.
   *
   * @type {string}
   * @memberof StorageClient
   */
  public readonly url: string;
  public readonly accountName: string;

  /**
   * Request policy pipeline.
   *
   * @internal
   * @ignore
   * @type {Pipeline}
   * @memberof StorageClient
   */
  protected readonly pipeline: Pipeline;

  /**
   * StorageClient is a reference to protocol layer operations entry, which is
   * generated by AutoRest generator.
   *
   * @protected
   * @type {StorageClientContext}
   * @memberof StorageClient
   */
  protected readonly storageClientContext: StorageClientContext;

  /**
   * Creates an instance of StorageClient.
   * @param {string} url
   * @param {Pipeline} pipeline
   * @memberof StorageClient
   */
  protected constructor(url: string, pipeline: Pipeline) {
    // URL should be encoded and only once, protocol layer shouldn't encode URL again
    this.url = escapeURLPath(url);
    this.accountName = getAccountNameFromUrl(url);

    this.pipeline = pipeline;
    this.storageClientContext = new StorageClientContext(
      SERVICE_VERSION,
      this.url,
      pipeline.toServiceClientOptions()
    );

    // Remove the default content-type in generated code of StorageClientContext
    const storageClientContext = this.storageClientContext as any;
    if (storageClientContext.requestContentType) {
      storageClientContext.requestContentType = undefined;
    }
  }
}